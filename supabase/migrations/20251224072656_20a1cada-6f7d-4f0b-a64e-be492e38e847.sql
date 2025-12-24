-- Add images column to properties table
ALTER TABLE public.properties 
ADD COLUMN images jsonb DEFAULT '[]'::jsonb;

-- Add a comment to document the expected schema
COMMENT ON COLUMN public.properties.images IS 'Array of image objects with schema: [{"title": "string", "url": "string"}]';