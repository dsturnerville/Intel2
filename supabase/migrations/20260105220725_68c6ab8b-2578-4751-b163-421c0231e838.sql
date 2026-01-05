-- Create markets table for MSA-level underwriting defaults
CREATE TABLE public.markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_name TEXT NOT NULL,
  market_code TEXT,
  misc_income_percent NUMERIC,
  vacancy_percent NUMERIC,
  bad_debt_percent NUMERIC,
  pm_fee_percent NUMERIC,
  leasing_fee_percent NUMERIC,
  cm_fee_percent NUMERIC,
  closing_costs_percent NUMERIC,
  ins_premium_rate_percent NUMERIC,
  ins_factor_rate_percent NUMERIC,
  ins_liability_premium NUMERIC,
  replacement_cost_sf NUMERIC,
  lost_rent NUMERIC,
  utilities NUMERIC,
  repairs_maintenance_percent NUMERIC,
  turnover_costs NUMERIC,
  turnover_rate_percent NUMERIC,
  blended_turnover NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated user access
CREATE POLICY "Authenticated users can view all markets"
ON public.markets
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create markets"
ON public.markets
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update markets"
ON public.markets
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete markets"
ON public.markets
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_markets_updated_at
BEFORE UPDATE ON public.markets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique index on market_name
CREATE UNIQUE INDEX idx_markets_market_name ON public.markets(market_name);

-- Create index on market_code for faster lookups
CREATE INDEX idx_markets_market_code ON public.markets(market_code);