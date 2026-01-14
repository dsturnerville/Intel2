-- Drop the existing units table (and its RLS policies)
DROP TABLE IF EXISTS public.units CASCADE;

-- Rename properties table to units
ALTER TABLE public.properties RENAME TO units;

-- Rename foreign key column in disposition_properties
ALTER TABLE public.disposition_properties RENAME COLUMN property_id TO unit_id;

-- Rename foreign key column in deal_properties
ALTER TABLE public.deal_properties RENAME COLUMN property_id TO unit_id;

-- Update the RLS policies for the renamed table
DROP POLICY IF EXISTS "Authenticated users can view all properties" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can create properties" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON public.units;
DROP POLICY IF EXISTS "Creator can delete properties" ON public.units;

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