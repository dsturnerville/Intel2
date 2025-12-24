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

    const parts = bbox.split(",").map((v) => Number(v));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
      return new Response(JSON.stringify(emptyFeatureCollection), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [xmin, ymin, xmax, ymax] = parts;

    // ArcGIS REST expects an envelope object (JSON) for geometryType=esriGeometryEnvelope
    const geometry = {
      xmin,
      ymin,
      xmax,
      ymax,
      spatialReference: { wkid: 4326 },
    };

    const params = new URLSearchParams({
      where: "1=1",
      outFields: "FLD_ZONE,ZONE_SUBTY",
      geometry: JSON.stringify(geometry),
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outSR: "4326",
      returnGeometry: "true",
      f: "geojson",
    });

    // Use /arcgis/rest (more reliable) rather than /gis/nfhl/rest
    const femaUrl =
      `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?${params.toString()}`;

    const response = await fetch(femaUrl, {
      headers: { Accept: "application/json" },
    });

    const text = await response.text();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("FEMA response not JSON", response.status, text.slice(0, 200));
      return new Response(JSON.stringify(emptyFeatureCollection), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok || parsed?.error) {
      console.error(
        "FEMA API error",
        response.status,
        parsed?.error ?? text.slice(0, 200),
      );
      return new Response(JSON.stringify(emptyFeatureCollection), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: Array.isArray(parsed?.features) ? parsed.features : [],
    };

    return new Response(JSON.stringify(geojson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching flood zones:", error);
    return new Response(JSON.stringify(emptyFeatureCollection), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
