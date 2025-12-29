-- Add default_department column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN default_department text DEFAULT 'Asset Management';