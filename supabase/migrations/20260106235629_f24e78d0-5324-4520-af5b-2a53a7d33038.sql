-- Remove per-property underwriting input override columns that are no longer used
-- All properties now use disposition-level defaults, so these columns are unnecessary

ALTER TABLE public.disposition_properties
  DROP COLUMN IF EXISTS sale_price_methodology,
  DROP COLUMN IF EXISTS cap_rate,
  DROP COLUMN IF EXISTS discount_to_market_value,
  DROP COLUMN IF EXISTS flat_sale_price,
  DROP COLUMN IF EXISTS broker_fee_percent,
  DROP COLUMN IF EXISTS closing_cost_percent,
  DROP COLUMN IF EXISTS seller_concessions_percent,
  DROP COLUMN IF EXISTS make_ready_capex_percent,
  DROP COLUMN IF EXISTS holding_period_months,
  DROP COLUMN IF EXISTS use_disposition_defaults;