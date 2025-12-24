-- Remove beds, baths, sqft columns from properties table
ALTER TABLE public.properties
  DROP COLUMN IF EXISTS beds,
  DROP COLUMN IF EXISTS baths,
  DROP COLUMN IF EXISTS sqft;