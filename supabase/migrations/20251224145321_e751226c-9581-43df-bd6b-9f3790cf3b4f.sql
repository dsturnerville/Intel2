-- Create units table with UUID primary key for consistency
CREATE TABLE public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text,
  property_type text,
  street_address text,
  building text,
  unit text,
  city text,
  state text,
  zipcode text,
  county text,
  bedrooms integer,
  bathrooms numeric,
  garage_spaces integer,
  stories integer,
  square_feet integer,
  year_built integer,
  brown_water text,
  has_pool boolean DEFAULT false,
  lot_size numeric,
  school_score numeric,
  hoa_id integer,
  subdivision text,
  legal_description text,
  latitude numeric,
  longitude numeric,
  renovation_date date,
  source text,
  source_name text,
  date_purchased date,
  date_sold date,
  asset_id_counter integer,
  asset_id text,
  markets_id integer,
  funds_id integer,
  portfolios_id integer,
  deals_id uuid[],
  purchase_price numeric,
  uw_arv numeric,
  uw_rent numeric,
  uw_capex numeric,
  cost_basis numeric,
  access_code text,
  updated_by_type text,
  updated_by_user_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- RLS Policies matching existing pattern
CREATE POLICY "Authenticated users can view all units"
ON public.units
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create units"
ON public.units
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update units"
ON public.units
FOR UPDATE
USING (true);

CREATE POLICY "Creator can delete units"
ON public.units
FOR DELETE
USING (auth.uid() = created_by);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_units_updated_at
BEFORE UPDATE ON public.units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();