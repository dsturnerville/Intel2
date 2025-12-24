-- ============================================================================
-- ENUMS
-- ============================================================================

-- Disposition status workflow
CREATE TYPE public.disposition_status AS ENUM (
  'Draft',
  'Under Review',
  'Approved to List',
  'Archived'
);

-- Disposition type (single or portfolio)
CREATE TYPE public.disposition_type AS ENUM (
  'Single Property',
  'Portfolio'
);

-- Sale price calculation methodology
CREATE TYPE public.sale_price_methodology AS ENUM (
  'Cap Rate Based',
  'Comp Based',
  'Flat Price Input'
);

-- Property occupancy status
CREATE TYPE public.occupancy_status AS ENUM (
  'Occupied',
  'Vacant',
  'Notice Given'
);

-- Deal status workflow
CREATE TYPE public.deal_status AS ENUM (
  'Pre-Listing',
  'Listed',
  'Under Contract',
  'Due Diligence',
  'Pending Close',
  'Closed',
  'Terminated'
);

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all profiles (internal team tool)
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PROPERTIES TABLE
-- ============================================================================

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Address
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  market TEXT NOT NULL,
  
  -- Physical attributes
  beds INTEGER NOT NULL DEFAULT 3,
  baths NUMERIC(3,1) NOT NULL DEFAULT 2,
  sqft INTEGER NOT NULL DEFAULT 1500,
  year_built INTEGER,
  lot_size INTEGER,
  
  -- Financial attributes
  acquisition_date DATE,
  acquisition_price NUMERIC(12,2),
  acquisition_basis NUMERIC(12,2),
  current_rent NUMERIC(10,2),
  
  -- Occupancy
  occupancy_status public.occupancy_status NOT NULL DEFAULT 'Vacant',
  lease_end_date DATE,
  
  -- Valuation
  estimated_market_value NUMERIC(12,2),
  last_appraisal_date DATE,
  last_appraisal_value NUMERIC(12,2),
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all properties
CREATE POLICY "Authenticated users can view all properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create properties
CREATE POLICY "Authenticated users can create properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update any property (team collaboration)
CREATE POLICY "Authenticated users can update properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (true);

-- Only creator can delete properties
CREATE POLICY "Creator can delete properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================================
-- DISPOSITIONS TABLE
-- ============================================================================

CREATE TABLE public.dispositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name TEXT NOT NULL,
  status public.disposition_status NOT NULL DEFAULT 'Draft',
  type public.disposition_type NOT NULL DEFAULT 'Single Property',
  
  -- Timeline
  target_list_date DATE,
  target_close_date DATE,
  
  -- Strategy
  exit_strategy_notes TEXT,
  investment_thesis TEXT,
  
  -- Default underwriting assumptions (JSONB for flexibility)
  defaults JSONB NOT NULL DEFAULT '{
    "salePriceMethodology": "Comp Based",
    "capRate": 0.055,
    "discountToMarketValue": 0.03,
    "brokerFeePercent": 0.05,
    "closingCostPercent": 0.02,
    "sellerConcessionsPercent": 0.01,
    "makeReadyCapexPercent": 0.015,
    "holdingPeriodMonths": 3
  }'::jsonb,
  
  -- Tags
  markets TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dispositions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all dispositions
CREATE POLICY "Authenticated users can view all dispositions"
  ON public.dispositions FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create dispositions
CREATE POLICY "Authenticated users can create dispositions"
  ON public.dispositions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can update dispositions
CREATE POLICY "Authenticated users can update dispositions"
  ON public.dispositions FOR UPDATE
  TO authenticated
  USING (true);

-- Only creator can delete dispositions
CREATE POLICY "Creator can delete dispositions"
  ON public.dispositions FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================================
-- DISPOSITION_PROPERTIES TABLE (Join with underwriting details)
-- ============================================================================

CREATE TABLE public.disposition_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disposition_id UUID NOT NULL REFERENCES public.dispositions(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Underwriting inputs (can override disposition defaults)
  use_disposition_defaults BOOLEAN NOT NULL DEFAULT true,
  sale_price_methodology public.sale_price_methodology,
  cap_rate NUMERIC(5,4),
  discount_to_market_value NUMERIC(5,4),
  flat_sale_price NUMERIC(12,2),
  broker_fee_percent NUMERIC(5,4),
  closing_cost_percent NUMERIC(5,4),
  seller_concessions_percent NUMERIC(5,4),
  make_ready_capex_percent NUMERIC(5,4),
  holding_period_months INTEGER,
  
  -- Calculated outputs (stored for performance, recalculated on input change)
  projected_sale_price NUMERIC(12,2),
  gross_sale_proceeds NUMERIC(12,2),
  broker_commission NUMERIC(12,2),
  closing_costs NUMERIC(12,2),
  seller_concessions NUMERIC(12,2),
  make_ready_capex NUMERIC(12,2),
  total_selling_costs NUMERIC(12,2),
  net_sale_proceeds NUMERIC(12,2),
  gain_loss_vs_basis NUMERIC(12,2),
  gain_loss_percent NUMERIC(8,4),
  simple_return NUMERIC(8,4),
  annualized_return NUMERIC(8,4),
  hold_period_years NUMERIC(6,2),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure unique property per disposition
  UNIQUE(disposition_id, property_id)
);

ALTER TABLE public.disposition_properties ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view disposition properties
CREATE POLICY "Authenticated users can view disposition properties"
  ON public.disposition_properties FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create disposition properties
CREATE POLICY "Authenticated users can create disposition properties"
  ON public.disposition_properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can update disposition properties
CREATE POLICY "Authenticated users can update disposition properties"
  ON public.disposition_properties FOR UPDATE
  TO authenticated
  USING (true);

-- All authenticated users can delete disposition properties
CREATE POLICY "Authenticated users can delete disposition properties"
  ON public.disposition_properties FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- DEALS TABLE
-- ============================================================================

CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disposition_id UUID REFERENCES public.dispositions(id) ON DELETE SET NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  status public.deal_status NOT NULL DEFAULT 'Pre-Listing',
  
  -- Listing details
  list_price NUMERIC(12,2),
  list_date DATE,
  
  -- Offer details
  offer_price NUMERIC(12,2),
  offer_date DATE,
  close_probability INTEGER CHECK (close_probability >= 0 AND close_probability <= 100),
  expected_close_date DATE,
  
  -- Actual close details
  actual_close_price NUMERIC(12,2),
  actual_close_date DATE,
  
  -- Property references (array of property IDs)
  property_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all deals
CREATE POLICY "Authenticated users can view all deals"
  ON public.deals FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create deals
CREATE POLICY "Authenticated users can create deals"
  ON public.deals FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can update deals
CREATE POLICY "Authenticated users can update deals"
  ON public.deals FOR UPDATE
  TO authenticated
  USING (true);

-- Only creator can delete deals
CREATE POLICY "Creator can delete deals"
  ON public.deals FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC PROFILE CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispositions_updated_at
  BEFORE UPDATE ON public.dispositions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disposition_properties_updated_at
  BEFORE UPDATE ON public.disposition_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_properties_market ON public.properties(market);
CREATE INDEX idx_properties_created_by ON public.properties(created_by);
CREATE INDEX idx_dispositions_status ON public.dispositions(status);
CREATE INDEX idx_dispositions_created_by ON public.dispositions(created_by);
CREATE INDEX idx_disposition_properties_disposition ON public.disposition_properties(disposition_id);
CREATE INDEX idx_disposition_properties_property ON public.disposition_properties(property_id);
CREATE INDEX idx_deals_disposition ON public.deals(disposition_id);
CREATE INDEX idx_deals_status ON public.deals(status);