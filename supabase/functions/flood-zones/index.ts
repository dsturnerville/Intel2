import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: unknown[];
};

const emptyFeatureCollection: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

type Envelope = {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: { wkid: 4326 };
};

function parseBBox(bbox: string): [number, number, number, number] | null {
  const parts = bbox.split(",").map((v) => Number(v));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  const [xmin, ymin, xmax, ymax] = parts;
  if (xmin === xmax || ymin === ymax) return null;
  return [
    Math.min(xmin, xmax),
    Math.min(ymin, ymax),
    Math.max(xmin, xmax),
    Math.max(ymin, ymax),
  ];
}

function tilesForBBox(
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number,
  maxTileDegrees: number,
): Envelope[] {
  const width = xmax - xmin;
  const height = ymax - ymin;

  let tilesX = Math.max(1, Math.ceil(width / maxTileDegrees));
  let tilesY = Math.max(1, Math.ceil(height / maxTileDegrees));

  // Cap total tiles to keep runtime bounded; increase tile size implicitly if needed.
  const maxTilesTotal = 64;
  const total = tilesX * tilesY;
  if (total > maxTilesTotal) {
    const factor = Math.sqrt(total / maxTilesTotal);
    tilesX = Math.max(1, Math.ceil(tilesX / factor));
    tilesY = Math.max(1, Math.ceil(tilesY / factor));
  }

  const dx = width / tilesX;
  const dy = height / tilesY;

  const envelopes: Envelope[] = [];
  for (let ix = 0; ix < tilesX; ix++) {
    for (let iy = 0; iy < tilesY; iy++) {
      const exmin = xmin + ix * dx;
      const exmax = ix === tilesX - 1 ? xmax : xmin + (ix + 1) * dx;
      const eymin = ymin + iy * dy;
      const eymax = iy === tilesY - 1 ? ymax : ymin + (iy + 1) * dy;
      envelopes.push({
        xmin: exmin,
        ymin: eymin,
        xmax: exmax,
        ymax: eymax,
        spatialReference: { wkid: 4326 },
      });
    }
  }

  return envelopes;
}

function splitEnvelope(env: Envelope): Envelope[] {
  const midX = (env.xmin + env.xmax) / 2;
  const midY = (env.ymin + env.ymax) / 2;

  return [
    {
      xmin: env.xmin,
      ymin: env.ymin,
      xmax: midX,
      ymax: midY,
      spatialReference: env.spatialReference,
    },
    {
      xmin: midX,
      ymin: env.ymin,
      xmax: env.xmax,
      ymax: midY,
      spatialReference: env.spatialReference,
    },
    {
      xmin: env.xmin,
      ymin: midY,
      xmax: midX,
      ymax: env.ymax,
      spatialReference: env.spatialReference,
    },
    {
      xmin: midX,
      ymin: midY,
      xmax: env.xmax,
      ymax: env.ymax,
      spatialReference: env.spatialReference,
    },
  ];
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFemaFloodZones(envelope: Envelope): Promise<FeatureCollection> {
  // FEMA/ArcGIS often truncates results; page via resultOffset/resultRecordCount.
  const pageSize = 500;
  const maxPages = 10; // hard cap per tile

  const features: unknown[] = [];

  for (let page = 0; page < maxPages; page++) {
    const offset = page * pageSize;

    const params = new URLSearchParams({
      where: "1=1",
      outFields: "FLD_ZONE,ZONE_SUBTY",
      geometry: JSON.stringify(envelope),
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outSR: "4326",
      returnGeometry: "true",
      f: "geojson",
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });

    const femaUrl =
      `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?${params.toString()}`;

    const res = await fetchWithTimeout(femaUrl, 12_000);
    const text = await res.text();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(
        `FEMA non-JSON response (status ${res.status}): ${text.slice(0, 120)}`,
      );
    }

    if (!res.ok || parsed?.error) {
      const msg = parsed?.error ? JSON.stringify(parsed.error) : text.slice(0, 200);
      throw new Error(`FEMA query failed (status ${res.status}): ${msg}`);
    }

    const pageFeatures = Array.isArray(parsed?.features) ? parsed.features : [];
    if (pageFeatures.length) features.push(...pageFeatures);

    // If we got less than a full page, we're done.
    if (pageFeatures.length < pageSize) break;

    // Keep response bounded even if upstream keeps paging.
    if (features.length >= 8000) break;
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Prefer JSON body (supports supabase.functions.invoke), fall back to querystring
    let bbox = url.searchParams.get("bbox") ?? undefined;
    if (!bbox && req.method !== "GET") {
      try {
        const body = await req.json();
        bbox = body?.bbox;
      } catch {
        // ignore
      }
    }

    if (!bbox || typeof bbox !== "string") {
      return new Response(JSON.stringify(emptyFeatureCollection), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsedBBox = parseBBox(bbox);
    if (!parsedBBox) {
      console.log("Invalid bbox:", bbox);
      return new Response(JSON.stringify(emptyFeatureCollection), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [xmin, ymin, xmax, ymax] = parsedBBox;

    // Tile the bbox for reliability (FEMA intermittently 500s on larger extents)
    const maxTileDegrees = 0.15;
    const envelopes = tilesForBBox(xmin, ymin, xmax, ymax, maxTileDegrees);

    console.log(
      "Flood zones request",
      { bbox: { xmin, ymin, xmax, ymax } },
      "tiles:",
      envelopes.length,
    );

    const outFeatures: unknown[] = [];
    let tilesOk = 0;
    let tilesFailed = 0;

    // Sequential to avoid hammering the upstream; small tiles make each call fast.
    for (const env of envelopes) {
      try {
        const fc = await fetchFemaFloodZones(env);
        tilesOk += 1;
        if (fc.features?.length) outFeatures.push(...fc.features);
      } catch (e) {
        tilesFailed += 1;
        console.error("Tile fetch failed, retrying as sub-tiles:", { env }, String(e));

        // Retry by splitting into 4 smaller envelopes
        for (const sub of splitEnvelope(env)) {
          try {
            const fc = await fetchFemaFloodZones(sub);
            tilesOk += 1;
            if (fc.features?.length) outFeatures.push(...fc.features);
          } catch (e2) {
            tilesFailed += 1;
            console.error("Sub-tile fetch failed:", { sub }, String(e2));
          }
        }
      }

      // Hard cap the overall response size
      if (outFeatures.length >= 12000) break;
    }

    console.log("Flood zones done", {
      tilesOk,
      tilesFailed,
      features: outFeatures.length,
    });

    const out: FeatureCollection = {
      type: "FeatureCollection",
      features: outFeatures,
    };

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flood zones:", error);
    return new Response(JSON.stringify(emptyFeatureCollection), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
