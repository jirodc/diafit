# Step-by-step: Deploy the “Register admin” Edge Function

Follow these steps from your computer. Use **PowerShell** or **Command Prompt** in the project folder: `C:\Users\Benhar\Downloads\diafit`.

---

## Step 1: Open the project folder in the terminal

1. Open PowerShell or Command Prompt.
2. Go to the **repo root** (the folder that *contains* the `supabase` folder):
   ```bash
   cd C:\Users\Benhar\Downloads\diafit
   ```
3. Confirm you are **not** inside `supabase`: your path should end with `\diafit`, not `\diafit\supabase`.
4. Confirm you see the `supabase` folder (e.g. run `dir supabase`).

---

## Step 2: Log in to Supabase

1. Run:
   ```bash
   npx supabase login
   ```
2. If it asks to install the package, type **y** and press Enter.
3. Your browser will open to a Supabase login page.
4. Sign in with your Supabase account (or create one at [supabase.com](https://supabase.com)).
5. When the page says you’re logged in, you can close the tab and return to the terminal.
6. The terminal should show that you’re logged in successfully.

---

## Step 3: Link this folder to your Supabase project

1. Run:
   ```bash
   npx supabase link
   ```
2. It will ask for your **project reference**.
   - Open [Supabase Dashboard](https://supabase.com/dashboard).
   - Click your project (e.g. “diafit”).
   - Go to **Project Settings** (gear icon) → **General**.
   - Copy the **Reference ID** (e.g. `ltcjsoaysfkilbjkftjn`).
3. Paste that Reference ID into the terminal when asked and press Enter.
4. If it asks for the database password, use the password you set when you created the project (or find it under Project Settings → Database).
5. When it says “Linked successfully” (or similar), you’re done with this step.

---

## Step 4: Deploy the Edge Function

1. **Make sure you are still in the repo root** (e.g. `C:\Users\Benhar\Downloads\diafit`), **not** inside the `supabase` folder. If your prompt shows `\diafit\supabase`, run:
   ```bash
   cd ..
   ```
2. Run:
   ```bash
   npx supabase functions deploy create-website-user
   ```
3. Wait for the command to finish. You should see something like “Deployed function create-website-user”.
4. If you see “Entrypoint path does not exist” or “failed to read file”, you are in the wrong folder—go back to Step 1 and use the repo root.

---

## Step 5: Confirm in the dashboard (optional)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. In the left sidebar, click **Edge Functions**.
3. You should see **create-website-user** in the list and that it’s deployed.

---

## Summary (copy-paste)

Run these in order. **Important:** run them from the repo root `C:\Users\Benhar\Downloads\diafit` (the folder that contains `supabase`), not from inside `supabase`:

```bash
cd C:\Users\Benhar\Downloads\diafit
npx supabase login
npx supabase link
npx supabase functions deploy create-website-user
```

After that, the “Register admin” feature in the admin tab will use the deployed function.

---

## Troubleshooting: 401 even when logged in as admin@diafit.com

The website and the Edge Function must use the **same Supabase project**. If you get "Request failed (401)" or "Invalid or expired token" while logged in as admin@diafit.com:

1. In **diafit-website/.env**, note the project in `VITE_SUPABASE_URL` (e.g. `https://xxxxx.supabase.co` → project ref is `xxxxx`).
2. When you ran `npx supabase link`, you chose a project. That project ref must match the one in `.env`.
3. In [Supabase Dashboard](https://supabase.com/dashboard), open the project that matches your `.env` URL. Under **Edge Functions**, confirm **create-website-user** is listed and deployed there.
4. If the function was deployed to a different project, run `npx supabase link` again, choose the **same** project as in `.env`, then run `npx supabase functions deploy create-website-user` again.

**401 even with the same project:** Supabase’s gateway can reject your JWT before it reaches the function (e.g. after key rotation). This repo sets `verify_jwt = false` for `create-website-user` in **supabase/config.toml** so the request reaches the function; the function still checks the JWT with `getUser()` and only allows admin@diafit.com. **Redeploy** so the config is applied:

```bash
cd C:\Users\Benhar\Downloads\diafit
npx supabase functions deploy create-website-user
```

---

## Optional: Admin “Active” status on the website

So that admin@diafit.com (and other admins) show as **Active** while using the admin panel, run the migration that adds `last_seen_at` to the `admins` table. In Supabase Dashboard → **SQL Editor**, run the contents of **supabase/migrations/20250212000000_add_admins_last_seen.sql**, or run:

```bash
npx supabase db push
```

from the repo root (with the project linked). After that, the admin panel will update `last_seen_at` every 2 minutes while you’re on the site, and User Management will show you as Active with a recent “Last active” time.
