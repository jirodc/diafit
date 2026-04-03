-- Lets the mobile app reject unknown emails before calling resetPasswordForEmail.
-- Tradeoff: anyone can call this RPC and learn whether an email is registered (enumeration).

CREATE OR REPLACE FUNCTION public.is_auth_email_registered(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE lower(trim(email)) = lower(trim(check_email))
  );
$$;

REVOKE ALL ON FUNCTION public.is_auth_email_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_auth_email_registered(text) TO anon;
GRANT EXECUTE ON FUNCTION public.is_auth_email_registered(text) TO authenticated;
