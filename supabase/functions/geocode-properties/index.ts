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

interface Market {
  id: string;
  market_name: string;
  latitude: number | null;
  longitude: number | null;
}

// Calculate distance between two points using Haversine formula (returns km)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the nearest market to a given lat/lon
function findNearestMarket(lat: number, lon: number, markets: Market[]): Market | null {
  const marketsWithCoords = markets.filter(m => m.latitude != null && m.longitude != null);
  if (marketsWithCoords.length === 0) return null;

  let nearestMarket: Market | null = null;
  let minDistance = Infinity;

  for (const market of marketsWithCoords) {
    const distance = haversineDistance(lat, lon, market.latitude!, market.longitude!);
    if (distance < minDistance) {
      minDistance = distance;
      nearestMarket = market;
    }
  }

  return nearestMarket;
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

    // Fetch all markets with coordinates for nearest market assignment
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('id, market_name, latitude, longitude');

    if (marketsError) {
      console.error('Error fetching markets:', marketsError);
    }

    const availableMarkets: Market[] = markets || [];
    console.log(`Found ${availableMarkets.length} markets for assignment`);

    // Fetch properties that need geocoding
    const { data: properties, error: fetchError } = await supabase
      .from('acquisition_properties')
      .select('id, address1, address2, city, state, zip_code, market_id')
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
    let marketAssignedCount = 0;
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

          // Prepare update data
          const updateData: { latitude: number; longitude: number; market_id?: string } = {
            latitude,
            longitude
          };

          // Assign nearest market if property doesn't already have one
          if (!property.market_id && availableMarkets.length > 0) {
            const nearestMarket = findNearestMarket(latitude, longitude, availableMarkets);
            if (nearestMarket) {
              updateData.market_id = nearestMarket.id;
              console.log(`Assigned market "${nearestMarket.market_name}" to ${property.address1}`);
              marketAssignedCount++;
            }
          }

          // Update property with coordinates and optionally market
          const { error: updateError } = await supabase
            .from('acquisition_properties')
            .update(updateData)
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

    console.log(`Geocoding complete: ${geocodedCount}/${properties.length} successful, ${marketAssignedCount} markets assigned`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        geocoded: geocodedCount, 
        total: properties.length,
        marketsAssigned: marketAssignedCount,
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
