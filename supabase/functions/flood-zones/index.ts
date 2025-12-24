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
  return [Math.min(xmin, xmax), Math.min(ymin, ymax), Math.max(xmin, xmax), Math.max(ymin, ymax)];
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

  const tilesX = Math.min(Math.max(1, Math.ceil(width / maxTileDegrees)), 4);
  const tilesY = Math.min(Math.max(1, Math.ceil(height / maxTileDegrees)), 4);

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

async function fetchFemaFloodZones(envelope: Envelope): Promise<FeatureCollection> {
  // ArcGIS REST expects an envelope object (JSON) for geometryType=esriGeometryEnvelope
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
    resultRecordCount: "500",
  });

  const femaUrl =
    `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?${params.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(femaUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    const text = await res.text();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`FEMA non-JSON response (status ${res.status}): ${text.slice(0, 120)}`);
    }

    if (!res.ok || parsed?.error) {
      const msg = parsed?.error ? JSON.stringify(parsed.error) : text.slice(0, 200);
      throw new Error(`FEMA query failed (status ${res.status}): ${msg}`);
    }

    return {
      type: "FeatureCollection",
      features: Array.isArray(parsed?.features) ? parsed.features : [],
    };
  } finally {
    clearTimeout(timeout);
  }
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

    // FEMA can intermittently 500 on large/extents; tile the bbox to improve reliability.
    const maxTileDegrees = 0.2;
    const envelopes = tilesForBBox(xmin, ymin, xmax, ymax, maxTileDegrees);

    console.log(
      "Flood zones request",
      { bbox: { xmin, ymin, xmax, ymax } },
      "tiles:",
      envelopes.length,
    );

    const features: unknown[] = [];
    let successes = 0;
    let failures = 0;

    // Sequential to avoid hammering the upstream; keep it simple and predictable.
    for (const env of envelopes) {
      try {
        const fc = await fetchFemaFloodZones(env);
        successes += 1;
        if (fc.features?.length) features.push(...fc.features);

        // Hard cap to keep response bounded
        if (features.length >= 2000) break;
      } catch (e) {
        failures += 1;
        console.error("Tile fetch failed:", { env }, String(e));
      }
    }

    console.log("Flood zones done", { successes, failures, features: features.length });

    const out: FeatureCollection = {
      type: "FeatureCollection",
      features,
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
