<!-- fcb7178c-8558-4d91-b09a-74c711579d3d d9727adc-6a67-45f8-b7b3-60eaf1d087f6 -->
# Family Karting App - Implementation Plan

## Overview

Create a Next.js 14+ application with Supabase integration for managing karting competition data. The app will feature admin authentication, CRUD operations for circuits, drivers, races, and laps, plus scoreboards with a points-based ranking system.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom F1-inspired theme
- **Authentication**: Supabase Auth (username/password)
- **ORM/Query**: Supabase Client or Prisma (TBD based on preference)
- **UI Components**: shadcn/ui or custom components
- **Icons**: Lucide React or similar

## Database Schema (Supabase)

### Tables to create:

1. **circuits**

   - id (uuid, primary key)
   - name (text)
   - description (text)
   - photo_url (text)
   - length (numeric)
   - url (text)
   - type (enum: 'outdoor', 'indoor')
   - location_lat (numeric)
   - location_long (numeric)
   - status (enum: 'active', 'inactive')
   - created_at, updated_at (timestamps)

2. **drivers**

   - id (uuid, primary key)
   - name (text)
   - birthday (date)
   - photo_url (text)
   - created_at, updated_at (timestamps)

3. **races**

   - id (uuid, primary key)
   - date (date)
   - status (enum: 'done', 'scheduled', 'planned')
   - circuit_id (uuid, foreign key)
   - description (text)
   - attachment_url (text)
   - created_at, updated_at (timestamps)

4. **laps**

   - id (uuid, primary key)
   - race_id (uuid, foreign key)
   - driver_id (uuid, foreign key)
   - lap_time (numeric) - in seconds
   - created_at, updated_at (timestamps)

5. **race_drivers** (junction table)

   - race_id (uuid, foreign key)
   - driver_id (uuid, foreign key)
   - position (integer) - finishing position
   - points (integer) - points earned
   - primary key (race_id, driver_id)

6. **admin_users** (or use Supabase Auth)

   - id (uuid, primary key)
   - username (text, unique)
   - password_hash (text) - or use Supabase Auth

## Application Structure

### Pages/Routes:

- `/` - Landing/Dashboard page
- `/login` - Admin login
- `/admin` - Admin dashboard
- `/admin/circuits` - Circuit CRUD
- `/admin/drivers` - Driver CRUD
- `/admin/races` - Race CRUD
- `/admin/laps` - Lap management
- `/circuits` - View all circuits
- `/circuits/[id]` - Circuit detail page
- `/drivers` - View all drivers
- `/drivers/[id]` - Driver detail page
- `/races` - View all races
- `/races/[id]` - Race detail page
- `/scoreboard` - Overall and yearly scoreboards

### Key Features:

1. **Admin Authentication**

   - Login page with username/password
   - Protected admin routes
   - Session management with Supabase Auth

2. **Circuit Management**

   - List view with photos
   - Create/Edit/Delete circuits
   - Display best lap results (from related laps)
   - Show races completed count
   - Map integration for location (optional)

3. **Driver Management**

   - List view with photos
   - Create/Edit/Delete drivers
   - Show race count
   - Display related races and laps

4. **Race Management**

   - Calendar/list view
   - Create/Edit/Delete races
   - Assign drivers to races
   - Upload attachments
   - Calculate race results based on fastest lap times
   - Auto-assign points (10, 8, 6, 4, 2, 1)

5. **Lap Management**

   - Add/edit lap times per race and driver
   - View all laps with filtering
   - Best lap tracking

6. **Scoreboard**

   - Overall leaderboard (all-time points)
   - Yearly leaderboards (filter by year)
   - Points calculation: 1st=10, 2nd=8, 3rd=6, 4th=4, 5th=2, 6th=1
   - Based on fastest lap time per race

## Design System

### Theme (F1-inspired, dark mode):

- **Colors**: 
  - Primary: Racing red (#FF1801) or team colors
  - Background: Dark (#0A0A0A, #1A1A1A)
  - Accent: Neon/glow effects
  - Text: White/light gray
- **Typography**: Modern sans-serif (Inter, Poppins, or similar)
- **Components**: 
  - Card-based layouts
  - Grid systems for data display
  - Animated transitions
  - Mobile-first responsive design

## Implementation Steps

1. **Project Setup**

   - Initialize Next.js with TypeScript
   - Configure Tailwind CSS
   - Set up Supabase client
   - Environment variables setup

2. **Database Setup**

   - Create Supabase project
   - Define schema and create tables
   - Set up Row Level Security (RLS) policies
   - Create database functions for scoreboard calculations

3. **Authentication**

   - Implement Supabase Auth
   - Create login page
   - Set up protected route middleware
   - Admin session management

4. **Core Components**

   - Layout components (header, sidebar for admin)
   - Data tables/lists
   - Forms (create/edit)
   - Card components
   - Loading states

5. **Admin Pages**

   - Circuit CRUD
   - Driver CRUD
   - Race CRUD (with driver assignment)
   - Lap management

6. **Public/View Pages**

   - Circuit listing and detail
   - Driver listing and detail
   - Race listing and detail
   - Scoreboard pages

7. **Scoreboard Logic**

   - Calculate race positions from lap times
   - Assign points based on positions
   - Aggregate points for overall/yearly rankings
   - Display with filtering

8. **Styling & Polish**

   - Apply F1-inspired dark theme
   - Mobile responsiveness
   - Animations and transitions
   - Image optimization

## File Structure

```
family-karting/
├── app/
│   ├── (auth)/
│\   │   └── login/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── circuits/
│   │   │   ├── drivers/
│   │   │   ├── races/
│   │   │   └── laps/
│   ├── circuits/
│   ├── drivers/
│   ├── races/
│   ├── scoreboard/
│   └── layout.tsx
├── components/
│   ├── admin/
│   ├── ui/
│   └── shared/
├── lib/
│   ├── supabase/
│   └── utils/
├── types/
└── public/
```

## Environment Variables Needed

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side)