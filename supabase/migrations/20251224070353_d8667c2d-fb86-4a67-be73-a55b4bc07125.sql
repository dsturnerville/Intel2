-- Add latitude and longitude columns to properties table
ALTER TABLE public.properties
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;