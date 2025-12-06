# Family Karting App

A Next.js application for tracking family karting competitions, circuits, drivers, races, and lap times with a Formula 1-inspired dark mode design.

## Features

- **Circuits Management**: Track all karting circuits with photos, descriptions, locations, operating hours, and stats
- **Drivers Management**: Manage driver profiles with photos and birthdays
- **Races Management**: Track races with status (done, scheduled, planned), circuits, and descriptions
- **Lap Times**: Record and manage lap times for each race and driver
- **Weather Integration**: Automatic weather data fetching for races using Open-Meteo API (historical and forecast data)
- **Operating Hours**: Track circuit operating hours with timezone support
- **Scoreboard**: Overall and yearly leaderboards with points system (10, 8, 6, 4, 2, 1)
- **Image Upload**: Direct image upload to Supabase Storage or URL-based images
- **Admin Panel**: Full CRUD operations for all data with authentication
- **Public Views**: Beautiful public-facing pages to view all information
- **Dark Mode**: Formula 1-inspired dark theme with racing aesthetics
- **Mobile Responsive**: Fully responsive design for all screen sizes

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for image uploads)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Weather API**: Open-Meteo (free, no API key required)
- **Utilities**: date-fns, tz-lookup, clsx, tailwind-merge
- **Deployment**: Vercel (optimized configuration included)

## Setup Instructions

For detailed setup instructions, see [SETUP.md](SETUP.md). Quick start guide below:

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the following files in order:
   - `supabase/schema.sql` - Main database schema
   - `supabase/add-write-policies.sql` - RLS policies for authenticated users
   - Run migrations in `supabase/migrations/` (optional if you ran schema.sql):
     - `001-add-time-to-races.sql`
     - `002-add-weather-to-races.sql`
     - `003-add-operating-hours-to-circuits.sql`
3. Get your Supabase URL and keys from Project Settings > API

### 3. Set Up Supabase Storage (for image uploads)

1. Go to Storage in Supabase Dashboard
2. Create a new public bucket named `images`
3. Run the SQL from `supabase/setup-storage.sql` to set up storage policies

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: You must restart the dev server after creating `.env.local`

### 5. Set Up Authentication

1. In Supabase Dashboard, go to Authentication > Users
2. Click "Add user" → "Create new user"
3. Enter an email and password for admin access
4. Use these credentials to log in at `/login`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses the following main tables:

### Core Tables

- **circuits**: Circuit information
  - Basic info: name, description, photo_url, url
  - Location: location_lat, location_long, length
  - Metadata: type (indoor/outdoor), status (active/inactive)
  - **New**: operating_hours (JSONB) - flexible operating hours with timezone support

- **drivers**: Driver profiles
  - Basic info: name, birthday, photo_url
  - Timestamps: created_at, updated_at

- **races**: Race information
  - Basic info: race_date, status (done/scheduled/planned), circuit_id, description, attachment_url
  - **Weather data** (auto-fetched from Open-Meteo):
    - weather_temp, weather_condition, weather_description, weather_icon
    - weather_humidity, weather_wind_speed, weather_fetched_at
  - **New**: race_time (for tracking specific race start times)

- **laps**: Lap times
  - Fields: race_id, driver_id, lap_time
  - Indexed for fast queries

- **race_drivers**: Race results (junction table)
  - Fields: race_id, driver_id, position, points
  - Automatically calculated based on fastest lap times

### Features

- **Row Level Security (RLS)**: Public read access, authenticated write access
- **Automatic timestamps**: created_at and updated_at fields auto-managed
- **Cascading deletes**: Deleting a race/circuit/driver removes related data
- **Indexed queries**: Optimized for performance with strategic indexes

## Points System

The scoreboard uses a simple points system:
- 1st place: 10 points
- 2nd place: 8 points
- 3rd place: 6 points
- 4th place: 4 points
- 5th place: 2 points
- 6th place: 1 point

Race positions are determined by the fastest lap time per driver in each race.

## Admin Access

1. Navigate to `/login`
2. Use your Supabase user credentials (email/password)
3. Access the admin panel at `/admin`

## Project Structure

```
family-karting/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin CRUD pages (protected)
│   │   ├── circuits/      # Circuit management
│   │   ├── drivers/       # Driver management
│   │   ├── races/         # Race management
│   │   └── laps/          # Lap time management
│   ├── circuits/          # Public circuit pages
│   ├── drivers/           # Public driver pages
│   ├── races/             # Public race pages
│   ├── scoreboard/        # Scoreboard page
│   ├── login/             # Login page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   │   ├── EditCircuitForm.tsx
│   │   ├── EditDriverForm.tsx
│   │   ├── EditRaceForm.tsx
│   │   ├── EditLapForm.tsx
│   │   ├── OperatingHoursInput.tsx
│   │   └── Delete*Button.tsx
│   ├── shared/           # Shared components
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── RacingBackground.tsx
│   └── ui/               # UI components
│       └── ImageUpload.tsx
├── lib/                  # Utilities and helpers
│   ├── actions/          # Server actions
│   │   ├── race-results.ts
│   │   └── weather.ts
│   ├── supabase/         # Supabase clients
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client
│   │   └── middleware.ts # Middleware client
│   ├── weather.ts        # Weather API integration
│   └── utils.ts          # Utility functions
├── types/                # TypeScript definitions
│   └── database.ts       # Database types
├── supabase/             # Database files
│   ├── schema.sql        # Main schema
│   ├── add-write-policies.sql
│   ├── setup-storage.sql
│   └── migrations/       # Database migrations
├── public/               # Static assets
│   ├── fonts/           # Custom fonts
│   └── logo.svg
├── middleware.ts         # Auth middleware
└── vercel.json          # Vercel deployment config
```

## Features in Detail

### Admin Panel
- **Full CRUD Operations**: Create, read, update, and delete circuits, drivers, races, and laps
- **Image Management**: Upload images directly to Supabase Storage or use external URLs
- **Automatic Race Results**: Race positions calculated automatically from fastest lap times
- **Points System**: Automatic points assignment (10, 8, 6, 4, 2, 1 for top 6 positions)
- **Weather Integration**: Fetch historical or forecast weather data for any race date
- **Operating Hours**: Set circuit operating hours with timezone awareness
- **Authentication**: Secure login with Supabase Auth
- **Mobile-Responsive**: Full admin functionality on mobile devices

### Weather System
- **Open-Meteo Integration**: Free weather API, no API key required
- **Historical Data**: Weather data available back to 1940
- **Forecast Data**: Weather forecasts up to 16 days ahead
- **Automatic Timezone**: Handles timezones automatically based on circuit location
- **Rich Data**: Temperature, conditions, humidity, wind speed, and weather icons
- **Caching**: Weather data cached for performance

### Public Pages
- **Beautiful UI**: Formula 1-inspired dark theme with racing aesthetics
- **Circuit Pages**: View all circuits with photos, descriptions, locations, and operating hours
- **Driver Profiles**: View driver stats, race history, and best lap times
- **Race Details**: Complete race results with lap times, positions, and weather conditions
- **Scoreboard**: Overall and yearly leaderboards with dynamic points calculation
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Performance**: Fast page loads with Next.js App Router and caching

## Deployment

The project includes a `vercel.json` configuration optimized for deployment to Vercel.

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

The `vercel.json` configuration includes:
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Region optimization (iad1)
- Next.js framework optimization

### Environment Variables for Production

Make sure to set the same environment variables in your production environment as in `.env.local`.

## Development

### Available Scripts

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Migrations

When making database changes:
1. Create a new migration file in `supabase/migrations/`
2. Name it with a number prefix: `00X-description.sql`
3. Apply it in your Supabase SQL Editor
4. Commit the migration file to version control

### Working with Weather Data

The weather system uses Open-Meteo API:
- No API key required
- Historical data back to 1940
- Forecasts up to 16 days
- Automatic timezone handling based on circuit coordinates
- Weather is fetched when creating/editing races with a date set

### Custom Fonts

The app uses custom "Tel Aviv Brutalist" fonts located in:
- `/font/` directory (for Next.js font optimization)
- `/public/fonts/` directory (for static serving)

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Create `.env.local` file with required variables
   - Restart dev server

2. **Login not working**
   - Check browser console for errors
   - Verify user exists in Supabase Authentication
   - Ensure environment variables are correct

3. **Images not uploading**
   - Verify storage bucket `images` exists in Supabase
   - Run `supabase/setup-storage.sql` to set up policies
   - Check authentication is working

4. **Weather data not fetching**
   - Ensure circuit has valid latitude/longitude coordinates
   - Check browser/server console for API errors
   - Open-Meteo API requires coordinates to be valid

For more detailed troubleshooting, see [SETUP.md](SETUP.md).

## License

This project is for personal/family use.

