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

// In-memory cache (best-effort; per-worker instance)
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { exp: number; value: FeatureCollection }>();

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

function constrainBBox(
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number,
  maxDegrees: number,
): [number, number, number, number] {
  const width = xmax - xmin;
  const height = ymax - ymin;
  if (width <= maxDegrees && height <= maxDegrees) return [xmin, ymin, xmax, ymax];

  const cx = (xmin + xmax) / 2;
  const cy = (ymin + ymax) / 2;
  const half = maxDegrees / 2;
  return [cx - half, cy - half, cx + half, cy + half];
}

function splitEnvelope(env: Envelope): Envelope[] {
  const midX = (env.xmin + env.xmax) / 2;
  const midY = (env.ymin + env.ymax) / 2;

  return [
    { xmin: env.xmin, ymin: env.ymin, xmax: midX, ymax: midY, spatialReference: env.spatialReference },
    { xmin: midX, ymin: env.ymin, xmax: env.xmax, ymax: midY, spatialReference: env.spatialReference },
    { xmin: env.xmin, ymin: midY, xmax: midX, ymax: env.ymax, spatialReference: env.spatialReference },
    { xmin: midX, ymin: midY, xmax: env.xmax, ymax: env.ymax, spatialReference: env.spatialReference },
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

async function fetchFema(envelope: Envelope): Promise<FeatureCollection> {
  // Keep compute bounded: at most 2 pages per envelope.
  const pageSize = 500;
  const maxPages = 2;

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

    const res = await fetchWithTimeout(femaUrl, 8000);
    const text = await res.text();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`FEMA non-JSON (status ${res.status}): ${text.slice(0, 120)}`);
    }

    if (!res.ok || parsed?.error) {
      const msg = parsed?.error ? JSON.stringify(parsed.error) : text.slice(0, 200);
      throw new Error(`FEMA error (status ${res.status}): ${msg}`);
    }

    const pageFeatures = Array.isArray(parsed?.features) ? parsed.features : [];
    if (pageFeatures.length) features.push(...pageFeatures);

    if (pageFeatures.length < pageSize) break;
  }

  return { type: "FeatureCollection", features };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

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

    // Prevent huge extents (and repeated WORKER_LIMIT) by constraining to a small area.
    const [xmin0, ymin0, xmax0, ymax0] = parsedBBox;
    const [xmin, ymin, xmax, ymax] = constrainBBox(xmin0, ymin0, xmax0, ymax0, 0.25);

    const cacheKey = `${xmin.toFixed(4)},${ymin.toFixed(4)},${xmax.toFixed(4)},${ymax.toFixed(4)}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.exp > Date.now()) {
      return new Response(JSON.stringify(cached.value), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const env: Envelope = {
      xmin,
      ymin,
      xmax,
      ymax,
      spatialReference: { wkid: 4326 },
    };

    console.log("Flood zones request", { bbox: { xmin, ymin, xmax, ymax } });

    let fc: FeatureCollection;
    try {
      // Fast path: one constrained request
      fc = await fetchFema(env);
    } catch (e) {
      // Retry path: split into 4 sub-tiles once (bounded)
      console.error("Primary FEMA request failed, retrying sub-tiles:", String(e));
      const subFeatures: unknown[] = [];
      let ok = 0;
      let fail = 0;

      for (const sub of splitEnvelope(env)) {
        try {
          const subFc = await fetchFema(sub);
          ok += 1;
          if (subFc.features?.length) subFeatures.push(...subFc.features);
        } catch (e2) {
          fail += 1;
          console.error("Sub-tile failed:", String(e2));
        }
      }

      console.log("Sub-tile summary", { ok, fail, features: subFeatures.length });
      fc = { type: "FeatureCollection", features: subFeatures };
    }

    cache.set(cacheKey, { exp: Date.now() + CACHE_TTL_MS, value: fc });

    return new Response(JSON.stringify(fc), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flood zones:", error);
    return new Response(JSON.stringify(emptyFeatureCollection), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
