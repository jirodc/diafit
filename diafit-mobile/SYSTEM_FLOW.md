# DiaFit Mobile — System Flow

This document describes how the DiaFit app is structured and how users and data move through the system.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DiaFit Mobile (Expo)                       │
│  React Native • Expo Router • Supabase (Auth + PostgreSQL)        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase                                                        │
│  • Auth (email/password, OAuth)                                  │
│  • Database (profiles, glucose, meals, workouts, schedule, labs)  │
│  • Edge Function: delete-user (account deletion)                 │
└─────────────────────────────────────────────────────────────────┘
```

- **Frontend:** Expo (React Native) app with file-based routing (`expo-router`).
- **Backend:** Supabase handles authentication, database, and (optionally) the `delete-user` Edge Function for account deletion.
- **State:** Session and profile completion are persisted via Supabase Auth and AsyncStorage.

---

## 2. App Entry & Routing Flow

### 2.1 Entry Point

- **`app/index.tsx`** is the initial screen. It shows a loading spinner and runs a single check:

  **If user has a session (signed in):**
  1. Fetch `profiles.full_name` for the current user.
  2. If **no username** (`full_name` empty or null) → `router.replace('/set-username')`.
  3. If **username exists** → set `@diafit_profile_complete` in AsyncStorage → `router.replace('/(tabs)/home')`.

  **If no session (not signed in):**
  1. Always → `router.replace('/onboarding')` (onboarding is shown every time for unauthenticated users).

### 2.2 Root Layout

- **`app/_layout.tsx`** wraps the app in `GestureHandlerRootView` and a **Stack** with no header.  
  Screens: `index`, `onboarding`, `(auth)`, `set-username`, `personal-info`, `settings`, `(tabs)`.

---

## 3. User Flows

### 3.1 First-Time / Unauthenticated Flow

```
App open
   │
   ▼
index.tsx (no session)
   │
   ▼
/onboarding  ──►  User taps "Get Started"
   │
   ▼
/(auth)/welcome  ──►  Sign Up or Sign In (email/password or OAuth)
   │
   ▼
[After successful sign-up]
   │
   ├── Email sign-up ──►  verify-email (if email confirmation required)
   │                          │
   │                          ▼
   ├── New user ──►  basic-info  ──►  diabetes-profile
   │
   └── All paths  ──►  router.replace('/')  ──►  index.tsx
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        │ Has session; check profile                     │
                        ▼                                                ▼
                 No full_name?                                    Has full_name?
                        │                                                │
                        ▼                                                ▼
                 /set-username                                    /(tabs)/home
                        │
                        ▼
                 Save name  ──►  /(tabs)/home
```

- **Onboarding** (`/onboarding`): Carousel of app benefits; "Get Started" → `/(auth)/welcome`.
- **Welcome** (`/(auth)/welcome`): Sign in / Sign up (email or OAuth). After success → `router.replace('/')`.
- **New users** (post sign-up): Optional flows through `basic-info` and `diabetes-profile`; both end with `router.replace('/')`.
- **Index again:** With a session, index checks `full_name`. Missing → `/set-username`; present → `/(tabs)/home`.

### 3.2 Set Username

- **`/set-username`**: Shown when the user is signed in but `profiles.full_name` is empty (e.g. OAuth sign-up).  
  User enters a display name → update `profiles` → set `@diafit_profile_complete` → `router.replace('/(tabs)/home')`.

### 3.3 Main App (Tabs)

After landing on **Home**, the user stays in the tab navigator unless they open a stack screen (e.g. Settings, Personal Info).

**Tab structure** (`app/(tabs)/_layout.tsx`):

| Tab    | Screen     | Purpose                    |
|--------|------------|----------------------------|
| Home   | `home`     | Dashboard, tips, 7-day glucose trend |
| Schedule | `schedule` | Calendar, daily view, tasks, create task |
| Add    | `add`      | Central “+” quick add      |
| Workouts | `workout`  | Workout templates & logs   |
| Meals  | `meal`     | Meal logging & history     |
| (Hidden) | `glucose`  | Glucose logging (e.g. from Home or Add) |
| (Hidden) | `lab-results` | Lab results              |
| (Hidden) | `profile`  | Profile menu, logout       |

- **Profile** and **Home** can navigate to: Personal Information (`/personal-info`), Settings (`/settings`), and Logout.  
- **Logout:** Confirm → `supabase.auth.signOut()` → clear `@diafit_profile_complete` → `router.replace('/(auth)/welcome')`.

### 3.4 Settings & Account Deletion

- **Settings** (`/settings`): Notifications, preferences, Data & Privacy, About.  
- **Delete Account:**  
  - Tap **Delete Account** → confirmation alert.  
  - On confirm → call **Supabase Edge Function** `delete-user` (with current session).  
  - Edge Function uses service role to `auth.admin.deleteUser(userId)`.  
  - On success: clear `@diafit_profile_complete`, optional `signOut()`, then `router.replace('/(auth)/welcome')`.  
  - Requires the `delete-user` function to be deployed (see `supabase/functions/delete-user/README.md`).

---

## 4. Data Flow & Backend

### 4.1 Authentication

- **Supabase Auth:** Email/password and OAuth (e.g. Google, Facebook).  
- Session is stored via **AsyncStorage** and used by the Supabase client for all API calls.  
- **Profiles:** `public.profiles` is keyed by `auth.users.id`; stores `full_name`, `email`, etc.

### 4.2 Main Data Entities (Supabase)

| Entity            | Table(s)              | Used In        |
|-------------------|------------------------|----------------|
| Profile           | `profiles`             | Index, set-username, personal-info, profile |
| Diabetes profile  | `diabetes_profiles`    | Onboarding (diabetes-profile), home |
| Glucose           | `glucose_readings`     | Glucose tab, Home (trend) |
| Meals             | `meal_logs`, `food_items` | Meal tab      |
| Workouts          | `workout_logs`, `workout_templates` | Workout tab |
| Schedule          | `scheduled_tasks`      | Schedule tab   |
| Lab results       | `lab_results`          | Lab results tab |

- All tables use **Row Level Security (RLS)** so each user only accesses their own rows (`auth.uid()` = `user_id` or profile `id`).

### 4.3 Notifications (Schedule / Tasks)

- **expo-notifications** used for local reminders.  
- When a **scheduled task** is created, updated, or toggled, the app calls `scheduleTaskNotifications()` in `lib/notifications.ts`.  
- Notifications are scheduled per weekday and time (weekly recurring).  
- Disabling a task or deleting it cancels its scheduled notifications.  
- **Permissions** are requested when the Schedule screen is used (or app starts and fetches tasks).

---

## 5. Key Screens Summary

| Route / Screen     | Role in flow |
|--------------------|--------------|
| `index`            | Entry: session check → onboarding or home/set-username. |
| `onboarding`      | First-time carousel → welcome. |
| `(auth)/welcome`   | Sign in / Sign up → `/` or verify-email / basic-info / diabetes-profile. |
| `(auth)/verify-email` | Email verification (if enabled). |
| `(auth)/basic-info`   | Optional onboarding step. |
| `(auth)/diabetes-profile` | Optional diabetes setup → `/`. |
| `set-username`    | Collect display name if missing → home. |
| `personal-info`   | View/edit name, read-only email. |
| `settings`        | App settings, Delete Account. |
| `(tabs)/home`     | Main dashboard, 7-day glucose trend, profile menu. |
| `(tabs)/schedule` | Calendar, daily view, create task, time picker, notifications. |
| `(tabs)/glucose`  | Log and list glucose readings. |
| `(tabs)/meal`     | Log and list meals. |
| `(tabs)/workout`  | Log and list workouts. |
| `(tabs)/lab-results` | Log and list lab results. |
| `(tabs)/profile`  | Profile card, links to personal-info, settings, logout. |

---

## 6. Flow Diagrams (Simplified)

### 6.1 Cold Start (No Session)

```
Open app → index → onboarding → welcome → sign in/up → index → [set-username if needed] → home
```

### 6.2 Cold Start (Has Session)

```
Open app → index → [set-username if no full_name] → home
```

### 6.3 Schedule → Daily View & Notifications

```
Schedule tab → Monthly view: tap day → Daily view for that date
            → Create task: name, time (wheel), repeat days, type → Save → DB + schedule notifications
            → Long-press task → Delete (confirm) → DB delete + cancel notifications
```

### 6.4 Delete Account

```
Settings → Delete Account → Confirm → Edge Function delete-user → clear local → welcome
```

---

## 7. Where to Find Things

| What you need           | Where to look |
|-------------------------|----------------|
| Entry & session logic   | `app/index.tsx` |
| Onboarding → auth       | `app/onboarding.tsx`, `app/(auth)/welcome.tsx` |
| Post-login username gate | `app/index.tsx`, `app/set-username.tsx` |
| Tabs & main screens     | `app/(tabs)/_layout.tsx`, `app/(tabs)/*.tsx` |
| Supabase client         | `lib/supabase.ts` |
| Notifications           | `lib/notifications.ts`, Schedule screen |
| Delete account          | `app/settings.tsx`, `supabase/functions/delete-user/` |
| Database schema & RLS   | `database/schema.sql` (project root) |

This README gives a single place to understand how the system fits together and how data and user flows move through the app and backend.
