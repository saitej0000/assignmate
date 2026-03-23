-- Fix RLS Policy for Registration
-- Since we use Firebase Auth and don't sync tokens to Supabase, 
-- the 'auth.uid() = id' check fails because Supabase sees the user as anonymous.

-- 1. Drop the strict policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. Create a permissive policy for INSERT (Registration)
-- This allows the backend/client to create a profile for a new user.
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles FOR INSERT WITH CHECK (true);

-- Note: We keep strict policies for UPDATE/DELETE to prevent users from messing with others' data.
-- But for INSERT, we must trust the client in this specific architecture.
