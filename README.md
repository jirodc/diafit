# DiaFit

Mobile and Web application for self-managing diabetes.

## Overview

DiaFit is a comprehensive diabetes management application that helps users track their glucose levels, meals, workouts, medications, and lab results. The app provides personalized insights and recommendations to help users maintain better control over their diabetes.

## Features

- **Glucose Tracking**: Log and monitor blood glucose readings with context (before/after meals, fasting, bedtime)
- **Meal Logging**: Track meals and nutrition with detailed macro information
- **Workout Plans**: Access personalized workout routines based on fitness level
- **Schedule Management**: Set reminders for meals and medications
- **Lab Results**: Store and track medical lab results
- **AI Insights**: Get personalized recommendations based on your data
- **Progress Tracking**: Visualize trends and improvements over time

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router
- **State Management**: React Hooks + AsyncStorage

## Project Structure

```
diafit/
├── diafit-mobile/          # React Native mobile app
│   ├── app/               # App screens and routes
│   ├── components/        # Reusable components
│   ├── lib/               # Utilities and Supabase client
│   └── assets/            # Images and static assets
├── database/              # Database schema and migrations
│   └── schema.sql        # Complete database schema
├── config/               # Configuration files
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd diafit
```

2. Install dependencies:
```bash
cd diafit-mobile
npm install
```

3. Set up Supabase:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database schema (see `database/README.md`)
   - Update `diafit-mobile/app.json` with your Supabase credentials

4. Start the development server:
```bash
npm start
```

5. Run on your device:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator / `a` for Android emulator

## Supabase Setup

See [database/README.md](./database/README.md) for detailed database setup instructions.

## Environment Variables

The Supabase configuration is stored in `diafit-mobile/app.json` under the `extra` section:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "YOUR_SUPABASE_URL",
      "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
    }
  }
}
```

## Database Schema

The application uses the following main tables:

- `profiles` - User profile information
- `diabetes_profiles` - Diabetes-specific user data
- `glucose_readings` - Blood glucose measurements
- `meal_logs` - Meal and nutrition tracking
- `workout_logs` - Workout completion records
- `scheduled_tasks` - Meal and medication reminders
- `lab_results` - Medical lab test results

See [database/schema.sql](./database/schema.sql) for the complete schema.

## Development

### Running the App

```bash
cd diafit-mobile
npm start
```

### Building for Production

```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@diafit.com or open an issue in the repository.
