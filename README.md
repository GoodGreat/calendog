# CalenDog

CalenDog is a dog sitting reservation calendar with a FastAPI backend, a React frontend, and Supabase Postgres for shared storage.

## What it does

- Shows reservations in a monthly calendar
- Supports creating, editing, and deleting reservations
- Displays multi-day stays as colored bars
- Sends reminder emails for reservations starting the next day

## Tech stack

- Backend: FastAPI
- Frontend: React, TypeScript, Vite
- Database: Supabase Postgres
- Styling: Tailwind CSS
- Email reminders: Resend

## Local development

Backend:

```bash
/usr/bin/python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
set -a
source backend/.env
set +a
.venv/bin/uvicorn backend.app.main:app --reload --app-dir .
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Environment variables

Backend:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `RESEND_API_KEY`
- `REMINDER_FROM_EMAIL`
- `REMINDER_RECIPIENTS`
- `REMINDER_TIMEZONE`
- `CRON_SECRET`

Frontend:

- `VITE_API_URL`

Example templates are included in:

- [backend/.env.example](/Users/almartinez/Desktop/calendog/backend/.env.example:1)
- [frontend/.env.example](/Users/almartinez/Desktop/calendog/frontend/.env.example:1)

## Database

Create the `reservations` table in Supabase before running the backend:

```sql
create extension if not exists pgcrypto;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  dog_name text not null,
  price numeric(10,2) not null,
  is_rover boolean not null default false,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

create index reservations_start_date_idx on public.reservations (start_date);
```

## Deployment

This repo is designed to be deployed as two Vercel projects from the same repository:

- `backend/`
- `frontend/`

The backend also includes a daily Vercel cron job in [backend/vercel.json](/Users/almartinez/Desktop/calendog/backend/vercel.json:1) for reminder emails.

## Tests

Backend:

```bash
.venv/bin/python -m pytest
```

Frontend:

```bash
cd frontend
npm test
```
