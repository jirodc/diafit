# delete-user Edge Function

This function permanently deletes the authenticated user's account. It is called from the app when the user taps **Delete Account** in Settings.

## Deploy

### Option 1: Using npx (No installation needed)

From the project root directory (where `supabase` folder is located):

1. **Link to your Supabase project** (if not already linked):
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   You can find your project ref in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

2. **Deploy the function**:
   ```bash
   npx supabase functions deploy delete-user
   ```

### Option 2: Install Supabase CLI globally

1. **Install the CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Link to your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Deploy**:
   ```bash
   supabase functions deploy delete-user
   ```

**Note:** Secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set automatically in the Supabase hosted environment. You don't need to configure them manually.

## Behavior

1. Reads the `Authorization: Bearer <jwt>` header from the request.
2. Validates the JWT and gets the authenticated user id.
3. Uses the service role client to call `auth.admin.deleteUser(userId)` to permanently delete the user.
4. Returns 200 on success so the app can clear local state and redirect to welcome screen.

## Testing Locally (Optional)

For local testing, you need Docker Desktop installed:

```bash
npx supabase start
npx supabase functions serve delete-user
```

Then test with a valid JWT token from your app.
