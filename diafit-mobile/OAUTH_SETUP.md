# Google & Facebook OAuth (Supabase Cloud)

The app uses Supabase Auth for **Continue with Google** and **Continue with Facebook**. You must enable these providers in Supabase and add the redirect URL.

## 1. Enable providers in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **Providers**.
3. Turn **on** **Google** and **Facebook**.
4. Enter the **Client ID** and **Client Secret** for each (see below).
5. Save.

## 2. Redirect URL (fixes Safari “couldn’t connect to the server”)

The app picks the redirect URL automatically:

- **Expo Go:** Uses the current dev URL (e.g. `exp://...` or, if you use a tunnel, `https://....exp.direct/--/`). **You must use a tunnel** so the redirect is an `https://` URL that Safari can open. Run: `npx expo start --tunnel`, then tap **Continue with Google/Facebook** once; in the terminal or Metro log you’ll see **OAuth redirect URL (add this in Supabase if needed):** — copy that **exact** URL and add it in Supabase (step 3).
- **Development build or production:** Uses **`diafitmobile://auth/callback`**. Add that in Supabase.

So: add **both** if you use both (Expo Go with tunnel + dev build), or just the one you use.

## 3. Add redirect URL in Supabase

1. **Authentication** → **URL Configuration** (or **Redirect URLs**).
2. Add **at least one** of:
   - **`diafitmobile://auth/callback`** (for dev build or production)
   - The **exact** URL printed in the console when you tap Google/Facebook in Expo Go (only valid when using `npx expo start --tunnel`; it looks like `https://xxxx.exp.direct/--/auth/callback`)
3. Save.

## 4. Google Cloud setup (for Google sign-in)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → your project (or create one).
2. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
3. Application type: **Web application** (Supabase uses this for the OAuth flow).
4. Add **Authorized redirect URIs**:  
   `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`  
   (Find your project ref in the Supabase dashboard URL or in **Settings** → **API**.)
5. Copy **Client ID** and **Client secret** into Supabase → **Authentication** → **Providers** → **Google**.

## 5. Facebook setup (for Facebook sign-in)

1. Go to [Facebook Developers](https://developers.facebook.com/) → your app (or create one).
2. **Settings** → **Basic**: copy **App ID** and **App Secret**.
3. **Facebook Login** → **Settings**:
   - Add **Valid OAuth Redirect URIs**:  
     `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
4. In Supabase → **Authentication** → **Providers** → **Facebook**, paste **App ID** as Client ID and **App Secret** as Client secret.
5. Save.

## 6. Test

1. In the app, tap **Continue with Google** or **Continue with Facebook**.
2. A browser (or in-app browser) opens for the provider’s login.
3. After you sign in, you are redirected back to the app and should be logged in.

If you see “redirect_uri_mismatch” or similar, the redirect URL in Supabase (and in Google/Facebook if they ask for it) must exactly match what the app sends (including scheme and path).

### “Safari can’t open the page because it couldn’t connect to the server”

This happens when the browser is redirected to a URL it can’t open (e.g. `exp://...` or `diafitmobile://...` in Expo Go).

- **If you’re using Expo Go:**  
  1. Start the dev server with a **tunnel**: `npx expo start --tunnel`.  
  2. Open the app, tap **Continue with Google** (or Facebook) once and check the **terminal/Metro** for the line: `OAuth redirect URL (add this in Supabase if needed): https://....exp.direct/...`  
  3. Copy that **full URL** and add it in Supabase → **Authentication** → **URL Configuration** → **Redirect URLs**, then save.  
  4. Try Google/Facebook again. The redirect will go to an `https://` page that Safari can load, then back into the app.

- **If you’re using a development build** (`npx expo run:ios` or `run:android`):  
  Add **`diafitmobile://auth/callback`** to Supabase redirect URLs. The app is registered for the `diafitmobile` scheme so the OS will open the app after sign-in.
