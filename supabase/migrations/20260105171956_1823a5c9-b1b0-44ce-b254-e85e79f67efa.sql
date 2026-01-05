-- Create opportunity type enum
CREATE TYPE public.opportunity_type AS ENUM ('SFR', 'BTR', 'MF');

-- Create opportunity occupancy enum
CREATE TYPE public.opportunity_occupancy AS ENUM ('Occupied', 'Vacant');

-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acquisition_id UUID NOT NULL REFERENCES public.acquisitions(id) ON DELETE CASCADE,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  msa TEXT,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  square_feet INTEGER,
  year_built INTEGER,
  included BOOLEAN NOT NULL DEFAULT true,
  type opportunity_type,
  occupancy opportunity_occupancy DEFAULT 'Vacant',
  current_rent NUMERIC,
  lease_start DATE,
  lease_end DATE,
  annual_hoa NUMERIC,
  property_tax NUMERIC,
  rent_avm NUMERIC,
  sales_avm NUMERIC,
  -- Underwriting inputs (can override acquisition defaults)
  use_acquisition_defaults BOOLEAN NOT NULL DEFAULT true,
  misc_income_percent NUMERIC,
  vacancy_bad_debt_percent NUMERIC,
  pm_fee_percent NUMERIC,
  ins_premium_rate NUMERIC,
  ins_factor_rate NUMERIC,
  ins_liability_premium NUMERIC,
  replacement_cost_per_sf NUMERIC,
  lost_rent NUMERIC,
  leasing_fee_percent NUMERIC,
  utilities NUMERIC,
  turnover_cost NUMERIC,
  turnover_rate_percent NUMERIC,
  blended_turnover NUMERIC,
  effective_tax_rate_percent NUMERIC,
  tax_increase_percent NUMERIC,
  rm_percent NUMERIC,
  turn_cost NUMERIC,
  cm_fee_percent NUMERIC,
  closing_costs_percent NUMERIC,
  -- Calculated outputs
  offer_price NUMERIC,
  projected_noi NUMERIC,
  projected_cap_rate NUMERIC,
  total_acquisition_cost NUMERIC,
  projected_annual_return NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view opportunities"
ON public.opportunities FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create opportunities"
ON public.opportunities FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update opportunities"
ON public.opportunities FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete opportunities"
ON public.opportunities FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();