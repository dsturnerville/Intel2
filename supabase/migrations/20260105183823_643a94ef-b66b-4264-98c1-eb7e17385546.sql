-- Drop the existing acquisition_properties table
DROP TABLE IF EXISTS public.acquisition_properties;

-- Rename opportunities table to acquisition_properties
ALTER TABLE public.opportunities RENAME TO acquisition_properties;

-- Update the RLS policies to reflect the new table name
-- First drop old policies
DROP POLICY IF EXISTS "Authenticated users can create opportunities" ON public.acquisition_properties;
DROP POLICY IF EXISTS "Authenticated users can delete opportunities" ON public.acquisition_properties;
DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON public.acquisition_properties;
DROP POLICY IF EXISTS "Authenticated users can view opportunities" ON public.acquisition_properties;

-- Create new policies with correct names
CREATE POLICY "Authenticated users can view acquisition properties"
ON public.acquisition_properties
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create acquisition properties"
ON public.acquisition_properties
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update acquisition properties"
ON public.acquisition_properties
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete acquisition properties"
ON public.acquisition_properties
FOR DELETE
USING (auth.uid() IS NOT NULL);