# DiaFit — Test Cases

This document lists test cases needed to validate the DiaFit mobile app and marketing website. Use it as a checklist for manual QA or as a spec for automated tests (e.g. Jest, Detox, Playwright).

---

## Table of Contents

1. [DiaFit Mobile (Expo)](#1-diafit-mobile-expo)
2. [DiaFit Website (Vite)](#2-diafit-website-vite)
3. [Backend & Integration](#3-backend--integration)

---

## 1. DiaFit Mobile (Expo)

### 1.1 Entry & Session

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-E1 | App open, no session | Launch app | Redirect to `/onboarding`. |
| M-E2 | App open, session + no username | Sign in (e.g. OAuth) so `profiles.full_name` is empty; restart app | Redirect to `/set-username`. |
| M-E3 | App open, session + username | Sign in, set username, restart app | Redirect to `/(tabs)/home`. |

### 1.2 Onboarding

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-O1 | Carousel and CTA | Open onboarding, swipe through screens, tap "Get Started" | Navigate to `/(auth)/welcome`. |
| M-O2 | Skip / back | Use back or skip if available | Behavior matches design (e.g. still lands on welcome or defined exit). |

### 1.3 Authentication (Welcome, Sign In, Sign Up)

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-A1 | Sign up with email | Enter email + password, submit | Account created; redirect to `/` then index logic (set-username or home). |
| M-A2 | Sign in with email | Enter valid email + password | Redirect to `/` then home or set-username. |
| M-A3 | Sign in with invalid credentials | Wrong email/password | Error shown; no redirect. |
| M-A4 | OAuth sign-in (e.g. Google) | Tap OAuth, complete provider flow | Session set; redirect to `/` then set-username or home. |
| M-A5 | Email verification (if enabled) | Sign up, then open verify-email | Can enter OTP / use resend; after verify, redirect to `/`. |
| M-A6 | Resend verification | On verify-email, tap resend | Resend succeeds; user can enter new code. |

### 1.4 Set Username

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-U1 | Set display name | Enter name, submit | `profiles.full_name` updated; redirect to `/(tabs)/home`. |
| M-U2 | Validation | Submit empty or invalid name (if validated) | Error or disabled submit per UX. |

### 1.5 Home Tab

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-H1 | Dashboard load | Open Home tab (signed in) | Profile data and 7-day glucose trend load without crash. |
| M-H2 | Profile menu | Open profile menu from Home | Can navigate to Personal Information, Settings, or Logout. |
| M-H3 | Logout from Home | Tap Logout, confirm | Sign out; redirect to `/(auth)/welcome`. |
| M-H4 | Quick add / navigation | Use any “Add” or shortcut to glucose/meal | Navigates to correct tab/screen and can log data. |

### 1.6 Schedule Tab

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-S1 | Monthly calendar | Open Schedule tab | Current month shown; tasks visible per day if any. |
| M-S2 | Tap a day | Tap a calendar day | Switch to daily view for that date; tasks for that day shown. |
| M-S3 | Create task | Open create task, set name, time (wheel), repeat days, type; Save | Task saved in DB; notifications scheduled for selected weekdays. |
| M-S4 | Time picker | Change hour and minute (and AM/PM) in wheel | Values update and persist on save. |
| M-S5 | Delete task | Long-press a task, confirm delete | Task removed from DB; its notifications cancelled. |
| M-S6 | Notifications permission | First use or after deny | Permission requested; graceful behavior if denied. |
| M-S7 | Toggle task (if supported) | Enable/disable a task | Notifications updated (scheduled or cancelled) accordingly. |

### 1.7 Glucose Tab

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-G1 | List readings | Open Glucose tab | Existing readings for user shown. |
| M-G2 | Add reading | Enter value (and time if applicable), submit | New row in `glucose_readings`; list updates. |
| M-G3 | Validation | Submit invalid value (e.g. out of range) | Error or validation message; no corrupt data. |

### 1.8 Meals Tab

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-M1 | List meals | Open Meals tab | User’s meal logs shown. |
| M-M2 | Add meal | Log a meal (time, items if applicable), submit | New row in `meal_logs`; list updates. |

### 1.9 Workouts Tab

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-W1 | List workouts | Open Workouts tab | User’s workout logs and/or templates shown. |
| M-W2 | Add workout | Log a workout (template or freeform), submit | New row in `workout_logs`; list updates. |

### 1.10 Lab Results Tab

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-L1 | List lab results | Open Lab Results tab | User’s lab results shown. |
| M-L2 | Add lab result | Enter result details, submit | New row in `lab_results`; list updates. |

### 1.11 Profile Tab

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-P1 | Profile card | Open Profile tab | Name and email (from `profiles`) displayed. |
| M-P2 | Personal Information | Tap Personal Information, edit name, save | `profiles.full_name` updated; UI reflects change. |
| M-P3 | Logout | Tap Logout, confirm | Sign out; redirect to welcome. |

### 1.12 Settings

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-ST1 | Open settings | Navigate to Settings | Notifications, preferences, Data & Privacy, About, Delete Account visible. |
| M-ST2 | Delete Account — confirm | Tap Delete Account, confirm in alert | Edge Function `delete-user` called; on success: local state cleared, sign out, redirect to `/(auth)/welcome`. |
| M-ST3 | Delete Account — cancel | Tap Delete Account, cancel alert | No API call; remain on Settings. |
| M-ST4 | Delete Account — failure | Simulate Edge Function error or network error | User sees error message; not signed out until success. |

### 1.13 Personal Info Screen

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-I1 | View and edit name | Open Personal Info, change full name, save | Profile updated; email read-only. |
| M-I2 | Read-only email | Open Personal Info | Email displayed but not editable (per current design). |

### 1.14 Auth Post-Login Flows (basic-info, diabetes-profile)

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-B1 | basic-info (if shown) | Complete basic info step | Data saved; redirect to next step or `/`. |
| M-B2 | diabetes-profile | Complete diabetes profile (if shown) | Data saved to `diabetes_profiles`; redirect to `/`. |

### 1.15 Gestures & Layout

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| M-X1 | No gesture crash | Use scrolls and gestures on Schedule (time wheel, list), modals | No “NativeViewGestureHandler must be descendant of GestureHandlerRootView” or similar. |
| M-X2 | Nested scroll | Scroll in schedule daily view and in create-task modal | Scroll works; no stuck or conflicting scroll. |

---

## 2. DiaFit Website (Vite)

### 2.1 Navigation & Layout

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| W-N1 | Home | Open `/` | Home page with hero, features, CTA. |
| W-N2 | About | Click “About Us” or “Learn More” → `/about` | About page with mission, values, team, stats. |
| W-N3 | Header links | Use Header: Home, About Us, Log In | Correct navigation; Log In opens login modal or `/login`. |
| W-N4 | Footer links | Click Product / Company / Legal links | Hash links (e.g. `/#features`) or routes work; no 404. |
| W-N5 | Login route | Open `/login` | Login modal or login content shown; close returns to home or previous route. |

### 2.2 Home Page

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| W-H1 | Hero and CTA | View hero; tap “Get Started” | Login modal opens (or redirect to app/login). |
| W-H2 | Learn More | Tap “Learn More” | Navigate to `/about`. |
| W-H3 | Features section | Scroll to features; use carousel if present | Content and images load; carousel advances (manual/auto). |
| W-H4 | How it works | Scroll to “How Diafit Works” | Three steps visible and readable. |
| W-H5 | Final CTA | Tap “Get Started” in bottom CTA | Same as W-H1. |

### 2.3 About Page

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| W-A1 | Content load | Open `/about` | Mission, quote, values, team, stats sections render. |
| W-A2 | Document title | Open `/about` | `document.title` is “About Us – Diafit” (or equivalent). |
| W-A3 | Images | Scroll through About | Images load (or placeholder); no broken images. |

### 2.4 Login Modal / Page

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| W-L1 | Open from header | Click “Log In” in header | Login modal opens (or navigate to `/login`). |
| W-L2 | Close | Close modal or tap “back” on `/login` | Modal closes or navigate to `/`; no crash. |
| W-L3 | Form (if wired) | Enter credentials and submit (if backend connected) | Success/error handling per implementation. |

### 2.5 Responsive & Assets

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| W-R1 | Mobile viewport | Resize to mobile width | Layout adapts; nav and CTAs usable. |
| W-R2 | External images | Load pages that use Unsplash (or similar) | Images load; CORS or proxy not blocking. |

---

## 3. Backend & Integration

### 3.1 Supabase Auth

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| B-A1 | Email sign-up | Sign up from app with email/password | User in `auth.users`; session returned. |
| B-A2 | Email sign-in | Sign in with existing user | Session returned; app redirects per flow. |
| B-A3 | OAuth | Complete OAuth flow | Session and profile (or placeholder) created. |
| B-A4 | Session refresh | Use app with valid session for extended time | Session stays valid or refreshes without unexpected logout. |

### 3.2 Supabase Database (RLS)

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| B-D1 | Profiles | Create/update profile for current user | Only that user’s row; RLS blocks other users. |
| B-D2 | Glucose / Meals / Workouts / Labs | Insert as user A, query as user B | User B cannot see user A’s rows. |
| B-D3 | Schedule tasks | Create task as user A | Visible only to user A; notifications scoped to that user. |

### 3.3 Edge Function: delete-user

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| B-E1 | Valid JWT | Call `delete-user` with valid session | User deleted in Auth; 200 or success response. |
| B-E2 | No/invalid JWT | Call without token or with invalid token | 401 or error; user not deleted. |
| B-E3 | App flow | Delete account from Settings (mobile) | Function invoked; on success app clears local state and redirects to welcome. |

### 3.4 Notifications (Mobile)

| ID | Scenario | Steps | Expected |
|----|----------|--------|----------|
| B-N1 | Schedule task | Create task with time and weekdays | Notifications scheduled for that time on selected days. |
| B-N2 | Delete task | Delete a scheduled task | Corresponding notifications cancelled. |
| B-N3 | Disable task | Turn task off (if supported) | Notifications cancelled or paused. |

---

## How to Use This Document

- **Manual QA:** Run through each table in a test environment; mark Pass/Fail and note build/device or browser.
- **Automation:** Map each ID to a test (e.g. `M-E1` → `entry.no-session.spec.ts`); keep IDs in test names for traceability.
- **Coverage:** Prioritize M-E*, M-A*, M-S*, M-ST2, W-N*, B-A*, B-D*, B-E* for smoke/regression.
- **Environments:** Test against a dedicated Supabase project (e.g. staging); ensure `delete-user` is deployed and RLS is enabled.

---

*Last updated: Feb 2025. Align with `diafit-mobile/SYSTEM_FLOW.md` and current app routes.*
