# Family Karting App

A Next.js application for tracking family karting competitions, circuits, drivers, races, and lap times with a Formula 1-inspired dark mode design.

## Features

- **Circuits Management**: Track all karting circuits with photos, descriptions, locations, and stats
- **Drivers Management**: Manage driver profiles with photos and birthdays
- **Races Management**: Track races with status (done, scheduled, planned), circuits, and descriptions
- **Lap Times**: Record and manage lap times for each race and driver
- **Scoreboard**: Overall and yearly leaderboards with points system (10, 8, 6, 4, 2, 1)
- **Admin Panel**: Full CRUD operations for all data
- **Public Views**: Beautiful public-facing pages to view all information
- **Dark Mode**: Formula 1-inspired dark theme with racing aesthetics

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your Supabase URL and anon key from Project Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set Up Authentication

1. In Supabase Dashboard, go to Authentication > Users
2. Create a new user with email/password for admin access
3. The app uses Supabase Auth for admin authentication

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses the following main tables:

- **circuits**: Circuit information (name, description, photo, location, type, status)
- **drivers**: Driver profiles (name, birthday, photo)
- **races**: Race information (date, status, circuit, description)
- **laps**: Lap times (race, driver, lap_time)
- **race_drivers**: Race results (position, points)

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
│   ├── admin/             # Admin CRUD pages
│   ├── circuits/          # Public circuit pages
│   ├── drivers/           # Public driver pages
│   ├── races/             # Public race pages
│   ├── scoreboard/        # Scoreboard page
│   └── login/             # Login page
├── components/            # React components
│   ├── admin/            # Admin components
│   └── shared/          # Shared components
├── lib/                  # Utilities and Supabase clients
├── types/                # TypeScript type definitions
└── supabase/             # Database schema
```

## Features in Detail

### Admin Panel
- Full CRUD operations for circuits, drivers, races, and laps
- Automatic race result calculation based on fastest lap times
- Points assignment based on race positions
- Mobile-responsive admin interface

### Public Pages
- Beautiful card-based layouts
- Circuit detail pages with best lap times
- Driver profiles with race history
- Race detail pages with results and lap times
- Overall and yearly scoreboards

## License

This project is for personal/family use.

