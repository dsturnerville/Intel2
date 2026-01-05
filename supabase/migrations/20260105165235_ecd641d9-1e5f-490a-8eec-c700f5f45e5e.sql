-- Create acquisition status enum
CREATE TYPE public.acquisition_status AS ENUM ('Draft', 'In Review', 'Approved', 'Under Contract', 'Closed', 'Archived');

-- Create acquisition type enum
CREATE TYPE public.acquisition_type AS ENUM ('Single Property', 'Portfolio', 'Bulk Purchase');

-- Create acquisitions table
CREATE TABLE public.acquisitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status public.acquisition_status NOT NULL DEFAULT 'Draft',
  type public.acquisition_type NOT NULL DEFAULT 'Single Property',
  markets TEXT[] DEFAULT '{}'::TEXT[],
  investment_thesis TEXT,
  strategy_notes TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  target_close_date DATE,
  defaults JSONB NOT NULL DEFAULT '{
    "miscIncomePercent": 0.02,
    "vacancyBadDebtPercent": 0.05,
    "pmFeePercent": 0.08,
    "insPremiumRate": 0.004,
    "insFactorRate": 1.0,
    "insLiabilityPremium": 150,
    "replacementCostPerSF": 150,
    "lostRent": 0,
    "leasingFeePercent": 0.5,
    "utilities": 0,
    "turnoverCost": 2500,
    "turnoverRatePercent": 0.25,
    "blendedTurnover": 625,
    "effectiveTaxRatePercent": 0.012,
    "taxIncreasePercent": 0.03,
    "rmPercent": 0.05,
    "turnCost": 2500,
    "cmFeePercent": 0.02,
    "closingCostsPercent": 0.02
  }'::JSONB,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create acquisition_properties table
CREATE TABLE public.acquisition_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acquisition_id UUID NOT NULL REFERENCES public.acquisitions(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  use_acquisition_defaults BOOLEAN NOT NULL DEFAULT true,
  
  -- Underwriting inputs (nullable - uses defaults if null)
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(acquisition_id, property_id)
);

-- Enable RLS
ALTER TABLE public.acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for acquisitions
CREATE POLICY "Authenticated users can view all acquisitions"
ON public.acquisitions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create acquisitions"
ON public.acquisitions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update acquisitions"
ON public.acquisitions FOR UPDATE
USING (true);

CREATE POLICY "Creator can delete acquisitions"
ON public.acquisitions FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for acquisition_properties
CREATE POLICY "Authenticated users can view acquisition properties"
ON public.acquisition_properties FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create acquisition properties"
ON public.acquisition_properties FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update acquisition properties"
ON public.acquisition_properties FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete acquisition properties"
ON public.acquisition_properties FOR DELETE
USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_acquisitions_updated_at
  BEFORE UPDATE ON public.acquisitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acquisition_properties_updated_at
  BEFORE UPDATE ON public.acquisition_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();