-- Add latitude and longitude columns to acquisition_properties
ALTER TABLE public.acquisition_properties
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;