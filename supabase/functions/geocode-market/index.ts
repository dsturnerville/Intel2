import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeMarketRequest {
  marketId: string;
  marketName: string;
}

interface MapboxFeature {
  center: [number, number]; // [longitude, latitude]
  place_name: string;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      console.error('MAPBOX_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Mapbox access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { marketId, marketName } = await req.json() as GeocodeMarketRequest;
    
    if (!marketId || !marketName) {
      return new Response(
        JSON.stringify({ error: 'Market ID and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoding market: ${marketName}`);

    // Call Mapbox Geocoding API - search for the MSA/metro area
    const encodedName = encodeURIComponent(marketName);
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedName}.json?access_token=${mapboxToken}&limit=1&country=US&types=place,region`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (!geocodeResponse.ok) {
      const errorText = await geocodeResponse.text();
      console.error(`Mapbox API error: ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Geocoding API error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geocodeData: MapboxResponse = await geocodeResponse.json();

    if (!geocodeData.features || geocodeData.features.length === 0) {
      console.log(`No results for: ${marketName}`);
      return new Response(
        JSON.stringify({ error: 'No geocoding results found for this market name' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [longitude, latitude] = geocodeData.features[0].center;
    console.log(`Geocoded ${marketName}: ${latitude}, ${longitude}`);

    // Update market with coordinates
    const { error: updateError } = await supabase
      .from('markets')
      .update({ latitude, longitude })
      .eq('id', marketId);

    if (updateError) {
      console.error(`Error updating market ${marketId}:`, updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update market: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        latitude, 
        longitude,
        place_name: geocodeData.features[0].place_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in geocode-market function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
