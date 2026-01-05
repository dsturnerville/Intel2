import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeRequest {
  propertyIds: string[];
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

    const { propertyIds } = await req.json() as GeocodeRequest;
    
    if (!propertyIds || propertyIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No property IDs provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoding ${propertyIds.length} properties`);

    // Fetch properties that need geocoding
    const { data: properties, error: fetchError } = await supabase
      .from('acquisition_properties')
      .select('id, address1, address2, city, state, zip_code')
      .in('id', propertyIds)
      .is('latitude', null);

    if (fetchError) {
      console.error('Error fetching properties:', fetchError);
      throw fetchError;
    }

    if (!properties || properties.length === 0) {
      console.log('No properties need geocoding');
      return new Response(
        JSON.stringify({ success: true, geocoded: 0, message: 'No properties need geocoding' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${properties.length} properties to geocode`);

    let geocodedCount = 0;
    const errors: string[] = [];

    // Process each property
    for (const property of properties) {
      try {
        // Build full address
        const addressParts = [
          property.address1,
          property.address2,
          property.city,
          property.state,
          property.zip_code
        ].filter(Boolean);
        
        const fullAddress = addressParts.join(', ');
        const encodedAddress = encodeURIComponent(fullAddress);

        console.log(`Geocoding: ${fullAddress}`);

        // Call Mapbox Geocoding API
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=US`;
        
        const geocodeResponse = await fetch(geocodeUrl);
        
        if (!geocodeResponse.ok) {
          const errorText = await geocodeResponse.text();
          console.error(`Mapbox API error for ${property.id}: ${errorText}`);
          errors.push(`Failed to geocode ${property.address1}: API error`);
          continue;
        }

        const geocodeData: MapboxResponse = await geocodeResponse.json();

        if (geocodeData.features && geocodeData.features.length > 0) {
          const [longitude, latitude] = geocodeData.features[0].center;

          // Update property with coordinates
          const { error: updateError } = await supabase
            .from('acquisition_properties')
            .update({ latitude, longitude })
            .eq('id', property.id);

          if (updateError) {
            console.error(`Error updating property ${property.id}:`, updateError);
            errors.push(`Failed to update ${property.address1}: ${updateError.message}`);
          } else {
            console.log(`Geocoded ${property.address1}: ${latitude}, ${longitude}`);
            geocodedCount++;
          }
        } else {
          console.log(`No results for: ${fullAddress}`);
          errors.push(`No geocoding results for ${property.address1}`);
        }

        // Rate limiting: wait 100ms between requests to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing property ${property.id}:`, err);
        errors.push(`Error processing ${property.address1}: ${errorMessage}`);
      }
    }

    console.log(`Geocoding complete: ${geocodedCount}/${properties.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        geocoded: geocodedCount, 
        total: properties.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in geocode-properties function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
