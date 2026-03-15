# Bootstrap first admin (admin@diafit.com)

Run this **once** to create the admin user and add them to the `admins` table.

## Deploy

```bash
# From repo root (parent of supabase/)
npx supabase link
npx supabase functions deploy bootstrap-admin
```

Optional: set a secret so only you can call it (recommended in production):

```bash
npx supabase secrets set BOOTSTRAP_SECRET=your-secret-here
```

Then call with `"secret": "your-secret-here"` in the body.

## Invoke

**Without secret** (if you didn’t set `BOOTSTRAP_SECRET`):

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/bootstrap-admin" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"password": "YourChosenPassword"}'
```

**With secret** (if you set `BOOTSTRAP_SECRET`):

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/bootstrap-admin" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"password": "YourChosenPassword", "secret": "your-secret-here"}'
```

Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` with your Supabase project ref and anon key.

After a successful response, log in on the website with **admin@diafit.com** and the password you used.

## Manual alternative

1. In **Supabase Dashboard** → **Authentication** → **Users** → **Add user**  
   - Email: `admin@diafit.com`  
   - Password: (choose one)

2. In **SQL Editor** run:

```sql
INSERT INTO public.admins (id, email)
SELECT id, email FROM auth.users WHERE email = 'admin@diafit.com';
```

Then log in on the website with that email and password.
