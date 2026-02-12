# Get the verification code in your signup email (Supabase Cloud)

This app uses **Supabase Cloud** (projects at [supabase.com](https://supabase.com)). By default Supabase sends only a **confirmation link**. To show the **8-digit code** in the email so you can enter it in the app, edit one template in the Supabase Dashboard.

---

## 1. Open Email Templates

1. Go to **[Supabase Dashboard](https://supabase.com/dashboard)** and open your project.
2. In the left sidebar: **Authentication** → **Email Templates**  
   Or: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF/auth/templates`

## 2. Edit the “Confirm signup” template

1. Click **“Confirm signup”** (or “Confirm sign up”).
2. You’ll see **Subject** and **Body** (HTML).

**Subject** (optional):

```text
Your DiaFit verification code
```

**Body** – include **`{{ .Token }}`** so the 8-digit code appears in the email. Example:

```html
<h2>Confirm your signup</h2>

<p>Hi,</p>

<p>Thanks for signing up for DiaFit. Use this code to verify your email:</p>

<p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">{{ .Token }}</p>

<p>Enter this 8-digit code in the app. It expires in 1 hour.</p>

<p>If you didn't sign up, you can ignore this email.</p>

<hr/>
<p style="color: #888; font-size: 12px;">Or confirm by opening this link in your browser:<br/>
<a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>
```

3. Click **Save**.

---

## Why this works

- On **Supabase Cloud**, the signup confirmation token is **8 digits**.
- The default template only shows **`{{ .ConfirmationURL }}`** (a link). Adding **`{{ .Token }}`** shows the same 8-digit code in the email body.
- The app’s Verify screen expects **8 digits** and calls `verifyOtp({ email, token, type: 'signup' })`.

---

## Test it

1. In the app, **sign up** with a **new** email (or one not confirmed yet).
2. Check inbox (and spam) for the “Confirm signup” email.
3. You should see the **8-digit code** (from `{{ .Token }}`) and the link (from `{{ .ConfirmationURL }}`).
4. Enter the **8-digit code** on the Verify email screen and tap **Verify Email**.

If you only see the link:

- You edited the **Confirm signup** template (not Magic Link).
- The body contains the exact text `{{ .Token }}` (with the dot and spaces).
- You clicked **Save**.
