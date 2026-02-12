# Troubleshooting: Not Receiving Verification Emails

If you're not receiving verification emails (even when clicking "Resend Code"), follow these steps:

## 1. Check Supabase Email Settings

### Enable Email Confirmation
1. Go to **Supabase Dashboard** → your project
2. **Authentication** → **Providers** → **Email**
3. Make sure **"Confirm email"** is **ON** (enabled)
4. Click **Save**

### Check Email Templates
1. Go to **Authentication** → **Email Templates**
2. Click **"Confirm signup"**
3. Make sure the template body includes `{{ .Token }}` (for the 8-digit code)
4. Click **Save**

## 2. Check Your Email

- **Check spam/junk folder** - Supabase emails often go to spam initially
- **Check all email folders** - some email clients have separate tabs
- **Wait 1-2 minutes** - emails can take a moment to arrive
- **Try a different email address** - some email providers block automated emails

## 3. Check Supabase Email Limits

Supabase's **free tier** has email sending limits:
- **Local development**: Uses Supabase's built-in email (may have delays)
- **Production**: Should configure custom SMTP for reliable delivery

### Check if emails are being sent:
1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for entries when you sign up or resend
3. Check for any error messages

## 4. "Email rate limit exceeded" – How to fix

Supabase Cloud limits how many verification/sign-up emails can be sent **per hour** (you can’t change this on Cloud). Waiting 1–2 minutes is often **not enough** – the limit is usually hourly.

**What to do:**

1. **Wait at least 1 hour** – Then try **Sign up** or **Resend code** again. The in-app 60s cooldown only prevents double-taps; it doesn’t override Supabase’s hourly limit.
2. **Or use a different email** – Sign up with another address that hasn’t had emails sent in the last hour.
3. **Don’t tap Resend repeatedly** – Each tap counts toward the limit. Use the “Resend code in 60s” countdown and then wait longer if you still see “rate limit exceeded”.

**If you see the error on Create Account:** Supabase is blocking new sign-up emails for a while. Wait **about 1 hour** and try again, or use a different email address.

## 5. Verify Email Address Format

Make sure you're using a **valid email format**:
- ✅ `user@example.com`
- ❌ `user@` (incomplete)
- ❌ `user.example.com` (missing @)

## 6. Test with a Different Email Provider

Some email providers (like Outlook, Yahoo) may block Supabase emails. Try:
- **Gmail** (usually works best)
- **ProtonMail**
- **Your own domain email** (if you have one)

## 7. Check Supabase Project Status

1. Go to **Supabase Dashboard** → **Project Settings**
2. Check if your project is **active** (not paused)
3. Check if you've hit any **usage limits**

## 8. Configure Custom SMTP (Recommended for Production)

For reliable email delivery, set up your own SMTP:

1. **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**
2. Configure with your email provider:
   - **Gmail**: Use App Password
   - **SendGrid**: Use API key
   - **Mailgun**: Use API credentials
   - **AWS SES**: Use AWS credentials

### Example: Gmail SMTP
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: [App Password from Google]
Sender email: your-email@gmail.com
Sender name: DiaFit
```

## 9. Debug in Development

If you're testing locally:

1. **Check console logs** - The app logs errors when resend fails
2. **Check Supabase Dashboard** → **Logs** → **Auth Logs** for detailed errors
3. **Try signing up with a different email** to see if it's email-specific

## 10. Common Error Messages

| Error Message | Solution |
|--------------|----------|
| "Email rate limit exceeded" | Wait 60 seconds before resending |
| "Invalid email address" | Check email format |
| "User already registered" | Sign in instead of signing up |
| "Email not confirmed" | Check spam folder, resend code |
| No error but no email | Check spam, wait 2 minutes, try different email |

## Quick Fix Checklist

- [ ] "Confirm email" is enabled in Supabase
- [ ] Email template includes `{{ .Token }}`
- [ ] Checked spam/junk folder
- [ ] Waited 2 minutes after requesting
- [ ] Tried a different email address
- [ ] Checked Supabase Auth Logs for errors
- [ ] Not hitting rate limits (wait 60 seconds between requests)

## Still Not Working?

1. **Check Supabase Status**: https://status.supabase.com
2. **Check Supabase Logs**: Dashboard → Logs → Auth Logs
3. **Try the confirmation link**: Even if you don't see the code, Supabase emails include a link - click it to verify
4. **Contact Support**: If nothing works, there may be an issue with your Supabase project configuration
