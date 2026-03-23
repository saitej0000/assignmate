-- Add full_name column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text;

-- Update the cache (Supabase usually handles this, but good to know)
NOTIFY pgrst, 'reload config';
