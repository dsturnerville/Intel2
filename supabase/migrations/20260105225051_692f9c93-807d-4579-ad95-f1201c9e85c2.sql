-- Add market_id column to acquisition_properties table
ALTER TABLE public.acquisition_properties
ADD COLUMN market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_acquisition_properties_market_id ON public.acquisition_properties(market_id);