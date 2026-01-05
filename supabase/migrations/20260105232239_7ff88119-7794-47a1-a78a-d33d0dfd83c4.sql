-- Add latitude and longitude to markets table for geographic matching
ALTER TABLE public.markets
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Create function to find and assign closest market based on geography
CREATE OR REPLACE FUNCTION public.assign_closest_market()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  closest_market_id uuid;
BEGIN
  -- Only run if the property has coordinates and no market assigned
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL AND NEW.market_id IS NULL THEN
    -- Find the closest market that has coordinates
    SELECT id INTO closest_market_id
    FROM public.markets
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    ORDER BY 
      sqrt(power(latitude - NEW.latitude, 2) + power(longitude - NEW.longitude, 2))
    LIMIT 1;
    
    -- Assign the closest market if found
    IF closest_market_id IS NOT NULL THEN
      NEW.market_id := closest_market_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on acquisition_properties table
DROP TRIGGER IF EXISTS assign_market_on_insert ON public.acquisition_properties;
CREATE TRIGGER assign_market_on_insert
  BEFORE INSERT ON public.acquisition_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_closest_market();