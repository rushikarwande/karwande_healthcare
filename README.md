# Karwande Healthcare Website

This project is a React + Vite website for Dr. Karwande Healthcare with:
- public website pages
- Supabase-backed admin panel at `/admin`
- editable content, gallery, logo, and service images
- Supabase Storage uploads for website assets

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- Supabase Auth
- Supabase Database
- Supabase Storage

## Project Run Guide

### 1. Install dependencies

```sh
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and add:

```sh
VITE_SUPABASE_URL=https://uxhrqbqcxoqbldpztpmi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

If `.env` already exists, just verify the values are correct.

### 3. Start the development server

```sh
npm run dev
```

Or on Windows, double-click:

```text
run-project.bat
```

By default Vite will show a local URL in the terminal, usually:

```sh
http://127.0.0.1:5173
```

### 4. Open the website

- website: `http://127.0.0.1:5173`
- admin panel: `http://127.0.0.1:5173/admin`

## Production Check Commands

Run these before handover or deployment:

```sh
npm run lint
npm run build
```

## Admin Panel Setup

The `/admin` route uses Supabase email/password login.

### Create an admin user

1. Open Supabase Dashboard
2. Go to `Authentication` -> `Users`
3. Click `Add user`
4. Add email and password
5. Save

Any authenticated Supabase user can log in to `/admin` and manage website content in this setup.

## Supabase SQL Setup

Run the SQL file below in Supabase SQL Editor:

```text
supabase/site_content_setup.sql
```

This SQL creates:
- `site_content` table
- `site-assets` storage bucket
- secure policies for public read and authenticated-user write access

Important:
- rerun the SQL if you change the access model later

## How To Share Project Using ngrok

Use ngrok when you want to show the local project to your client without deploying it.

### 1. Start the Vite server with host access

```sh
npm run dev -- --host 0.0.0.0 --port 5173
```

Keep this terminal open.

### 2. Start ngrok in another terminal

If ngrok is already installed:

```sh
ngrok http 5173
```

ngrok will give you a public forwarding URL like:

```text
https://abcd-12-34-56-78.ngrok-free.app
```

### 3. Share the link

Share:
- website: `https://your-ngrok-link`
- admin: `https://your-ngrok-link/admin`

## First-Time ngrok Setup

If ngrok is not installed:

1. Download ngrok from the official ngrok website
2. Install it
3. Log in to your ngrok account
4. add your auth token once:

```sh
ngrok config add-authtoken YOUR_TOKEN
```

Then run:

```sh
ngrok http 5173
```

## Important Demo Notes

When showing the project through ngrok:
- your computer must stay on
- the Vite server must keep running
- ngrok must keep running
- if either process stops, the shared link stops working
- free ngrok links usually change each time you restart ngrok

## Handover Checklist

Before handing over to the client, verify:

1. `npm run lint` completes without errors
2. `npm run build` succeeds
3. Supabase SQL has been run successfully
4. the client email exists in Supabase Auth
5. `/admin` login works with the client credentials
6. content save works from `/admin`
8. gallery image upload and crop work
9. call buttons open correctly on mobile
10. map button and embedded map both work

## Main Paths

- public homepage: `/`
- admin panel: `/admin`
- SQL setup file: `supabase/site_content_setup.sql`
- Supabase client: `src/lib/supabase.ts`
- content provider: `src/content/siteContent.tsx`
- admin page: `src/pages/AdminPage.tsx`




