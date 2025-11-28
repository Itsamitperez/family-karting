# Quick Setup Guide

## ⚠️ IMPORTANT: Environment Variables Required

**You must create a `.env.local` file before the app will work!**

### Step 1: Create `.env.local` file

1. In the root directory of this project, create a new file named `.env.local`
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → paste into `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → paste into `SUPABASE_SERVICE_ROLE_KEY` (⚠️ keep this secret!)

### Step 3: Restart the Development Server

After creating `.env.local`, you **must restart** your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Create Admin User

1. In Supabase Dashboard, go to Authentication > Users
2. Click "Add user" → "Create new user"
3. Enter an email and password
4. Use these credentials to log in to the app

## Setup Image Storage (Optional)

To enable image uploads (not just URLs), set up Supabase Storage:

1. In Supabase Dashboard, go to **Storage**
2. Click **"New bucket"**
3. Name it `images` and check **"Public bucket"**
4. Go to **SQL Editor** and run the SQL from `supabase/setup-storage.sql`:

```sql
-- Allow public read access to all files in the images bucket
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'images');
```

This allows you to upload images directly in the admin panel!

## Troubleshooting Login

If login isn't working:

1. **Check browser console** - Open DevTools (F12) and check the Console tab for errors
2. **Verify environment variables** - Make sure `.env.local` exists and has the correct values
3. **Restart dev server** - After creating `.env.local`, restart with `npm run dev`
4. **Check Supabase** - Verify the user exists in Supabase Authentication

## Common Issues

### "Missing Supabase environment variables"
- Create `.env.local` file in the root directory
- Add the required environment variables
- Restart the development server

### "Invalid login credentials"
- Verify the user exists in Supabase Authentication
- Check that you're using the correct email/password
- Make sure the user is confirmed (not pending)

### "Nothing happens when clicking login"
- Check browser console for errors
- Verify environment variables are loaded (check console logs)
- Make sure the form is submitting (check Network tab)

