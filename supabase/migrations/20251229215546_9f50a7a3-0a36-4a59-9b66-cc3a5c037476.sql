-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all dispositions" ON public.dispositions;

-- Create a new SELECT policy that explicitly requires authentication
CREATE POLICY "Authenticated users can view all dispositions" 
ON public.dispositions 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);