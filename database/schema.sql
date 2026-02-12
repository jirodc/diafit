-- DiaFit Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Diabetes profile information
CREATE TABLE IF NOT EXISTS public.diabetes_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  diabetes_type TEXT CHECK (diabetes_type IN ('type1', 'type2', 'gestational', 'prediabetes', 'other')),
  year_diagnosed INTEGER,
  target_glucose_min INTEGER DEFAULT 80,
  target_glucose_max INTEGER DEFAULT 130,
  medication_types TEXT[], -- Array of medication types
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- GLUCOSE READINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.glucose_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  value INTEGER NOT NULL CHECK (value > 0 AND value < 1000), -- mg/dL
  context TEXT CHECK (context IN ('before', 'after', 'fasting', 'bedtime', 'random')) NOT NULL,
  reading_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_id ON public.glucose_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_reading_time ON public.glucose_readings(reading_time DESC);

-- ============================================
-- MEALS & NUTRITION
-- ============================================

-- Food items database (can be expanded)
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  calories INTEGER DEFAULT 0,
  carbs DECIMAL(10, 2) DEFAULT 0, -- grams
  protein DECIMAL(10, 2) DEFAULT 0, -- grams
  fat DECIMAL(10, 2) DEFAULT 0, -- grams
  fiber DECIMAL(10, 2) DEFAULT 0, -- grams
  serving_size TEXT, -- e.g., "1 cup", "100g"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Meal logs
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
  custom_food_name TEXT, -- For user-created foods
  category TEXT CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  servings DECIMAL(5, 2) DEFAULT 1.0,
  total_calories INTEGER DEFAULT 0,
  total_carbs DECIMAL(10, 2) DEFAULT 0,
  total_protein DECIMAL(10, 2) DEFAULT 0,
  total_fat DECIMAL(10, 2) DEFAULT 0,
  total_fiber DECIMAL(10, 2) DEFAULT 0,
  meal_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON public.meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_meal_time ON public.meal_logs(meal_time DESC);

-- ============================================
-- WORKOUTS & FITNESS
-- ============================================

-- Workout templates
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  estimated_calories INTEGER DEFAULT 0,
  exercises JSONB, -- Array of exercise objects
  tips TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workout logs
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workout_template_id UUID REFERENCES public.workout_templates(id) ON DELETE SET NULL,
  custom_workout_name TEXT, -- For user-created workouts
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER DEFAULT 0,
  completed_exercises JSONB, -- Array of completed exercises
  workout_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_workout_date ON public.workout_logs(workout_date DESC);

-- ============================================
-- SCHEDULE & REMINDERS
-- ============================================

-- Scheduled tasks (meals and medications)
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  task_type TEXT CHECK (task_type IN ('meal', 'medication')) NOT NULL,
  time TEXT NOT NULL, -- e.g., "8:00 AM"
  enabled BOOLEAN DEFAULT true,
  repeat_days BOOLEAN[] DEFAULT ARRAY[true, true, true, true, true, true, true], -- [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  medication_dosage TEXT, -- e.g., "500mg", "10 units"
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_id ON public.scheduled_tasks(user_id);

-- Task completion logs
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_task_id UUID REFERENCES public.scheduled_tasks(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  skipped BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON public.task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_completed_at ON public.task_completions(completed_at DESC);

-- ============================================
-- LAB RESULTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL, -- e.g., "HbA1c", "Fasting Glucose"
  test_value DECIMAL(10, 2) NOT NULL,
  unit TEXT, -- e.g., "%", "mg/dL"
  reference_range TEXT, -- e.g., "4.0-5.6%"
  test_date DATE NOT NULL,
  lab_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON public.lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test_date ON public.lab_results(test_date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diabetes_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Diabetes profiles policies
CREATE POLICY "Users can view their own diabetes profile"
  ON public.diabetes_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own diabetes profile"
  ON public.diabetes_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diabetes profile"
  ON public.diabetes_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Glucose readings policies
CREATE POLICY "Users can view their own glucose readings"
  ON public.glucose_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own glucose readings"
  ON public.glucose_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glucose readings"
  ON public.glucose_readings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glucose readings"
  ON public.glucose_readings FOR DELETE
  USING (auth.uid() = user_id);

-- Meal logs policies
CREATE POLICY "Users can view their own meal logs"
  ON public.meal_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal logs"
  ON public.meal_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs"
  ON public.meal_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs"
  ON public.meal_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Workout logs policies
CREATE POLICY "Users can view their own workout logs"
  ON public.workout_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout logs"
  ON public.workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs"
  ON public.workout_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs"
  ON public.workout_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Scheduled tasks policies
CREATE POLICY "Users can view their own scheduled tasks"
  ON public.scheduled_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled tasks"
  ON public.scheduled_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled tasks"
  ON public.scheduled_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled tasks"
  ON public.scheduled_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Task completions policies
CREATE POLICY "Users can view their own task completions"
  ON public.task_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task completions"
  ON public.task_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task completions"
  ON public.task_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task completions"
  ON public.task_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Lab results policies
CREATE POLICY "Users can view their own lab results"
  ON public.lab_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab results"
  ON public.lab_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab results"
  ON public.lab_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab results"
  ON public.lab_results FOR DELETE
  USING (auth.uid() = user_id);

-- Food items are public (read-only for all authenticated users)
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view food items"
  ON public.food_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert food items"
  ON public.food_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Workout templates are public (read-only for all authenticated users)
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workout templates"
  ON public.workout_templates FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_diabetes_profiles
  BEFORE UPDATE ON public.diabetes_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_glucose_readings
  BEFORE UPDATE ON public.glucose_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_meal_logs
  BEFORE UPDATE ON public.meal_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_workout_logs
  BEFORE UPDATE ON public.workout_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_scheduled_tasks
  BEFORE UPDATE ON public.scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_lab_results
  BEFORE UPDATE ON public.lab_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
