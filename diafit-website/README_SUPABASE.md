# Diafit Website – Supabase

The website uses the **same Supabase project** as the mobile app. It has its own tables and Edge Functions.

## Env

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL` – e.g. `https://YOUR_PROJECT_REF.supabase.co`
- `VITE_SUPABASE_ANON_KEY` – from Supabase Dashboard → Project Settings → API

Use the same values as in the mobile app (`app.json` / `EXPO_PUBLIC_*`) if you share one project.

## Website-only tables

Defined in repo: `database/website_tables.sql`. Already created in your project:

| Table | Purpose |
|-------|---------|
| `admins` | User IDs that can access `/admin` (must exist in `auth.users`) |
| `website_user_profiles` | Profiles for users created by admin (e.g. `*@diafit.com`) |
| `contact_submissions` | Contact form (name, email, message) |
| `newsletter_subscribers` | Newsletter signups (email) |

## First admin

1. In Supabase Dashboard → Authentication → Users, create a user with email **admin@diafit.com** and a password (or sign up once on the site with that email).
2. In SQL Editor run:
   ```sql
   INSERT INTO public.admins (id, email)
   SELECT id, email FROM auth.users WHERE email = 'admin@diafit.com';
   ```
   Or, if the `admins` table is empty, the first sign-in with **admin@diafit.com** will self-register (bootstrap policy).

## Register admin (superadmin only)

Superadmins register new admins with `*@diafit.com` via **Admin → Register admin**. That calls the Edge Function **create-website-user**.

**Deploy the function:** see the step-by-step guide in the repo root: **[DEPLOY_EDGE_FUNCTION.md](../DEPLOY_EDGE_FUNCTION.md)**. In short: run `npx supabase login`, then `npx supabase link`, then `npx supabase functions deploy create-website-user` from the repo root.

The function creates the user in Supabase Auth and inserts a row into `admins`. New admins can log in when ready (no redirect; they are just registered).

## Contact / newsletter

- **Contact:** Insert into `contact_submissions` (anon or authenticated). Only admins can read (RLS).
- **Newsletter:** Insert into `newsletter_subscribers` (anon or authenticated). Only admins can read (RLS).

You can add forms on the site that call `supabase.from('contact_submissions').insert({...})` and `supabase.from('newsletter_subscribers').insert({...})`.
