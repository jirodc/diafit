# DiaFit Database Setup Guide

This guide will help you set up the Supabase database for the DiaFit application.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- A new Supabase project created

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: diafit (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the `schema.sql` file from this directory
4. Copy the entire contents of `schema.sql`
5. Paste it into the SQL Editor
6. Click "Run" (or press Ctrl+Enter / Cmd+Enter)
7. Wait for the query to complete (should take a few seconds)

You should see a success message indicating that all tables, policies, and triggers were created.

## Step 4: Verify Tables Were Created

1. In Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - `profiles`
   - `diabetes_profiles`
   - `glucose_readings`
   - `food_items`
   - `meal_logs`
   - `workout_templates`
   - `workout_logs`
   - `scheduled_tasks`
   - `task_completions`
   - `lab_results`

## Step 5: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable the providers you want to use:
   - **Email** (enabled by default)
   - **Google** (optional)
   - **Facebook** (optional)

### Email Authentication Settings

- **Enable email confirmations**: Recommended for production
- **Enable email change confirmations**: Recommended
- **Secure email change**: Enable for better security

## Step 6: Update App Configuration

Update `diafit-mobile/app.json` with your Supabase credentials:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "YOUR_PROJECT_URL",
      "supabaseAnonKey": "YOUR_ANON_KEY"
    }
  }
}
```

## Database Schema Overview

### Core Tables

#### `profiles`
Stores basic user profile information linked to Supabase auth users.

#### `diabetes_profiles`
Stores diabetes-specific information:
- Diabetes type (Type 1, Type 2, etc.)
- Year diagnosed
- Target glucose ranges
- Medication types

#### `glucose_readings`
Tracks blood glucose measurements:
- Glucose value (mg/dL)
- Context (before meal, after meal, fasting, bedtime)
- Timestamp
- Optional notes

#### `meal_logs`
Records meals and nutrition:
- Links to food items or custom foods
- Meal category (breakfast, lunch, dinner, snack)
- Nutritional information (calories, carbs, protein, fat, fiber)
- Timestamp

#### `food_items`
Database of food items with nutritional information (can be expanded).

#### `workout_templates`
Predefined workout routines:
- Name and description
- Fitness level (beginner, intermediate, advanced)
- Duration and estimated calories
- Exercise list and tips

#### `workout_logs`
Tracks completed workouts:
- Links to workout templates or custom workouts
- Duration and calories burned
- Completion date

#### `scheduled_tasks`
Manages recurring tasks:
- Task name and type (meal or medication)
- Time and repeat schedule
- Enabled/disabled status

#### `task_completions`
Logs when scheduled tasks were completed or skipped.

#### `lab_results`
Stores medical lab test results:
- Test name (e.g., HbA1c)
- Test value and unit
- Reference range
- Test date

## Row Level Security (RLS)

All tables have Row Level Security enabled, ensuring users can only access their own data. Policies are automatically created for:

- **SELECT**: Users can view their own records
- **INSERT**: Users can create their own records
- **UPDATE**: Users can update their own records
- **DELETE**: Users can delete their own records

## Functions and Triggers

### Automatic Profile Creation
When a new user signs up via Supabase Auth, a profile is automatically created in the `profiles` table.

### Updated Timestamps
All tables with an `updated_at` column automatically update this timestamp when a record is modified.

## Testing the Setup

### Test Authentication

1. In your app, try signing up a new user
2. Check Supabase **Authentication** → **Users** to see the new user
3. Check **Table Editor** → **profiles** to see the automatically created profile

### Test Data Insertion

You can test inserting data using the Supabase SQL Editor:

```sql
-- Get your user ID first
SELECT id FROM auth.users LIMIT 1;

-- Insert a test glucose reading (replace USER_ID with actual ID)
INSERT INTO public.glucose_readings (user_id, value, context, reading_time)
VALUES ('USER_ID', 120, 'before', NOW());

-- Verify it was inserted
SELECT * FROM public.glucose_readings;
```

## Troubleshooting

### Tables Not Created
- Make sure you ran the entire `schema.sql` file
- Check for any error messages in the SQL Editor
- Verify you have the correct permissions

### RLS Policies Not Working
- Ensure RLS is enabled on all tables
- Check that policies were created successfully
- Verify user authentication is working

### Profile Not Created on Signup
- Check that the trigger function `handle_new_user()` exists
- Verify the trigger `on_auth_user_created` is attached to `auth.users`
- Check Supabase logs for any errors

## Next Steps

1. **Seed Initial Data** (optional):
   - Add some food items to `food_items` table
   - Add workout templates to `workout_templates` table

2. **Set Up Storage** (if needed):
   - Create storage buckets for user-uploaded images
   - Configure storage policies

3. **Configure Email Templates**:
   - Customize email templates in **Authentication** → **Email Templates**

## Security Best Practices

1. **Never expose your service_role key** in client-side code
2. **Use RLS policies** to protect user data
3. **Enable email confirmations** in production
4. **Regularly review** your RLS policies
5. **Monitor** your database for unusual activity

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review the SQL Editor for error messages
3. Consult [Supabase documentation](https://supabase.com/docs)
4. Open an issue in the repository
