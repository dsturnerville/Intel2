-- Add market_id column to properties table that references markets
ALTER TABLE public.properties
ADD COLUMN market_id uuid REFERENCES public.markets(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_properties_market_id ON public.properties(market_id);