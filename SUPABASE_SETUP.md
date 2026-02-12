# Supabase Connection Setup

This document provides a quick reference for connecting DiaFit to Supabase.

## Current Configuration

Your Supabase credentials are already configured in the project:

- **URL**: `https://ltcjsoaysfkilbjkftjn.supabase.co`
- **Anon Key**: Configured in `diafit-mobile/app.json`

## Quick Setup Checklist

- [x] Supabase project created
- [x] Database schema executed
- [x] App configuration updated
- [ ] Authentication providers configured (optional)
- [ ] Initial data seeded (optional)

## Using Supabase in Your Code

### Import the Supabase Client

```typescript
import { supabase } from '@/lib/supabase';
```

### Example: Sign Up a User

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      full_name: 'John Doe',
    },
  },
});
```

### Example: Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword',
});
```

### Example: Insert Glucose Reading

```typescript
const { data, error } = await supabase
  .from('glucose_readings')
  .insert({
    value: 120,
    context: 'before',
    reading_time: new Date().toISOString(),
    notes: 'Before breakfast',
  });
```

### Example: Fetch User's Glucose Readings

```typescript
const { data, error } = await supabase
  .from('glucose_readings')
  .select('*')
  .order('reading_time', { ascending: false })
  .limit(10);
```

### Example: Insert Meal Log

```typescript
const { data, error } = await supabase
  .from('meal_logs')
  .insert({
    food_item_id: 'food-uuid',
    category: 'breakfast',
    servings: 1.5,
    total_calories: 350,
    total_carbs: 45,
    total_protein: 20,
    total_fat: 10,
    meal_time: new Date().toISOString(),
  });
```

### Example: Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Example: Sign Out

```typescript
await supabase.auth.signOut();
```

## Available Tables

All tables are protected by Row Level Security (RLS), so users can only access their own data.

### User Data Tables
- `profiles` - User profiles
- `diabetes_profiles` - Diabetes-specific information

### Tracking Tables
- `glucose_readings` - Blood glucose measurements
- `meal_logs` - Meal and nutrition logs
- `workout_logs` - Completed workouts
- `scheduled_tasks` - Recurring tasks (meals/medications)
- `task_completions` - Task completion history
- `lab_results` - Medical lab results

### Reference Tables
- `food_items` - Food database (public, read-only)
- `workout_templates` - Workout templates (public, read-only)

## Authentication Flow

1. User signs up → Profile automatically created
2. User signs in → Session stored in AsyncStorage
3. User makes requests → Supabase client includes auth token
4. RLS policies → Ensure user only sees their data

## Real-time Subscriptions (Optional)

You can subscribe to real-time updates:

```typescript
const subscription = supabase
  .channel('glucose-readings')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'glucose_readings' 
    }, 
    (payload) => {
      console.log('New glucose reading:', payload.new);
    }
  )
  .subscribe();
```

## Error Handling

Always check for errors:

```typescript
const { data, error } = await supabase.from('glucose_readings').select('*');

if (error) {
  console.error('Error:', error.message);
  // Handle error
} else {
  // Use data
  console.log('Data:', data);
}
```

## Next Steps

1. Implement authentication in your app screens
2. Connect your UI components to Supabase
3. Add error handling and loading states
4. Test all CRUD operations
5. Add real-time updates if needed

For more examples, see the Supabase documentation: https://supabase.com/docs
