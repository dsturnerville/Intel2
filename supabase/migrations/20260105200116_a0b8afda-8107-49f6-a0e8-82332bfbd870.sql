-- Add asking_price column to acquisition_properties table
ALTER TABLE public.acquisition_properties
ADD COLUMN asking_price numeric;