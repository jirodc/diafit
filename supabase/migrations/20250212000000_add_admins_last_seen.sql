-- Allow tracking when admins are using the website (admin panel).
-- Run this in Supabase SQL Editor or via: supabase db push

ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

COMMENT ON COLUMN public.admins.last_seen_at IS 'Set by the admin panel when the admin is viewing the site; used for Active/Inactive status.';

-- Allow authenticated users to update their own row in admins (for last_seen_at heartbeat).
DROP POLICY IF EXISTS "Admins can update own last_seen_at" ON public.admins;
CREATE POLICY "Admins can update own last_seen_at"
  ON public.admins FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
