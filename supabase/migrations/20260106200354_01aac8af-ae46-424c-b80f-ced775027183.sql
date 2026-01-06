-- Phase 1: Unified Deals Table Migration

-- 1.1 Create deal_type enum
CREATE TYPE public.deal_type AS ENUM ('Acquisition', 'Disposition');

-- 1.2 Add new statuses to deal_status enum for acquisitions
ALTER TYPE public.deal_status ADD VALUE IF NOT EXISTS 'LOI Submitted' BEFORE 'Under Contract';
ALTER TYPE public.deal_status ADD VALUE IF NOT EXISTS 'LOI Accepted' BEFORE 'Under Contract';
ALTER TYPE public.deal_status ADD VALUE IF NOT EXISTS 'PSA Executed' AFTER 'Under Contract';

-- 1.3 Modify deals table - add new columns
ALTER TABLE public.deals 
  ADD COLUMN IF NOT EXISTS deal_type public.deal_type NOT NULL DEFAULT 'Disposition',
  ADD COLUMN IF NOT EXISTS acquisition_id uuid REFERENCES public.acquisitions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asking_price numeric,
  ADD COLUMN IF NOT EXISTS purchase_price numeric,
  ADD COLUMN IF NOT EXISTS earnest_money numeric,
  ADD COLUMN IF NOT EXISTS earnest_money_date date,
  ADD COLUMN IF NOT EXISTS inspection_period_days integer,
  ADD COLUMN IF NOT EXISTS inspection_end_date date,
  ADD COLUMN IF NOT EXISTS financing_contingency_date date,
  ADD COLUMN IF NOT EXISTS notes text;

-- 1.4 Migrate existing data from old columns to new columns
UPDATE public.deals SET 
  asking_price = list_price,
  purchase_price = offer_price
WHERE list_price IS NOT NULL OR offer_price IS NOT NULL;

-- 1.5 Create deal_properties join table
CREATE TABLE public.deal_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  acquisition_property_id uuid REFERENCES public.acquisition_properties(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT deal_property_reference CHECK (
    property_id IS NOT NULL OR acquisition_property_id IS NOT NULL
  )
);

-- 1.6 Enable RLS on deal_properties
ALTER TABLE public.deal_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deal properties" 
  ON public.deal_properties FOR SELECT USING (auth.uid() IS NOT NULL);
  
CREATE POLICY "Authenticated users can create deal properties" 
  ON public.deal_properties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  
CREATE POLICY "Authenticated users can update deal properties" 
  ON public.deal_properties FOR UPDATE USING (auth.uid() IS NOT NULL);
  
CREATE POLICY "Authenticated users can delete deal properties" 
  ON public.deal_properties FOR DELETE USING (auth.uid() IS NOT NULL);

-- 1.7 Migrate existing property_ids array to join table
INSERT INTO public.deal_properties (deal_id, property_id)
SELECT d.id, unnest(d.property_ids)
FROM public.deals d
WHERE d.property_ids IS NOT NULL AND array_length(d.property_ids, 1) > 0;

-- 1.8 Drop old columns
ALTER TABLE public.deals 
  DROP COLUMN IF EXISTS list_price,
  DROP COLUMN IF EXISTS offer_price,
  DROP COLUMN IF EXISTS property_ids;

-- 1.9 Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON public.deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_acquisition_id ON public.deals(acquisition_id);
CREATE INDEX IF NOT EXISTS idx_deals_disposition_id ON public.deals(disposition_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deal_properties_deal_id ON public.deal_properties(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_properties_property_id ON public.deal_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_deal_properties_acquisition_property_id ON public.deal_properties(acquisition_property_id);