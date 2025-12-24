import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const bbox = url.searchParams.get('bbox');
    
    if (!bbox) {
      return new Response(
        JSON.stringify({ error: 'Missing bbox parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // FEMA National Flood Hazard Layer - Flood Hazard Zones (Layer 28)
    const femaUrl = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?where=1%3D1&outFields=FLD_ZONE,ZONE_SUBTY&geometry=${encodeURIComponent(bbox)}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=geojson`;

    const response = await fetch(femaUrl);
    
    if (!response.ok) {
      throw new Error(`FEMA API returned ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching flood zones:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch flood zone data', features: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
