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
        JSON.stringify({ error: 'Missing bbox parameter', features: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching flood zones for bbox:', bbox);

    // FEMA National Flood Hazard Layer - Flood Hazard Zones (Layer 28)
    // Using proper geometry format for ArcGIS REST API
    const femaUrl = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?` +
      `where=1%3D1` +
      `&outFields=FLD_ZONE,ZONE_SUBTY` +
      `&geometry=${bbox}` +
      `&geometryType=esriGeometryEnvelope` +
      `&inSR=4326` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&outSR=4326` +
      `&f=geojson`;

    console.log('FEMA URL:', femaUrl);

    const response = await fetch(femaUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('FEMA response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FEMA API error:', errorText);
      // Return empty features instead of error to prevent map issues
      return new Response(
        JSON.stringify({ type: 'FeatureCollection', features: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('FEMA data features count:', data.features?.length || 0);

    // Ensure proper GeoJSON structure
    const geojson = {
      type: 'FeatureCollection',
      features: data.features || []
    };

    return new Response(
      JSON.stringify(geojson),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching flood zones:', error);
    // Return empty features to prevent map errors
    return new Response(
      JSON.stringify({ type: 'FeatureCollection', features: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
