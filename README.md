# CalenDog

CalenDog is a minimalist dog sitting reservation calendar. It gives a single-page monthly view where reservations can be added and reviewed as continuous multi-day bars, with separate styling for Rover and private bookings.

## Stack

- Backend: Python, FastAPI
- Database: Supabase Postgres
- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS
- Date utilities: date-fns
- Icons: lucide-react
- Backend testing: pytest
- Frontend testing: Vitest

## Purpose

The app is meant to be a lightweight scheduling tool for dog sitting. Instead of a complex booking system, it focuses on a fast monthly overview:

- View reservations in a custom month calendar
- Add new reservations with owner, dog, price, source, and date range
- Show multi-day stays as horizontal bars across the calendar grid
- Distinguish Rover bookings from private bookings by color

## Project Structure

```text
calendog/
  backend/
    app/
    tests/
  frontend/
    src/
```

## Backend

The FastAPI backend provides:

- `GET /reservations`
- `POST /reservations`
- `PUT /reservations/{id}`
- `DELETE /reservations/{id}`
- `GET /cron/reminders`

Reservations are persisted in Supabase Postgres through the `DATABASE_URL` environment
variable.

## Frontend

The frontend is a Vite React app with:

- A custom month-view calendar built with CSS Grid
- Previous and next month navigation
- A reservation form modal
- Tailwind-based playful, clean styling

## Local Development

Create a backend virtual environment from the system Python and install dependencies:

```bash
/usr/bin/python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
```

Copy the example environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set `backend/.env` to your Supabase transaction pooler connection string, and set
`frontend/.env` to the backend URL you want the web app to call.

For reminder emails, also set these backend variables:

- `RESEND_API_KEY`
- `REMINDER_FROM_EMAIL`
- `REMINDER_RECIPIENTS`
- `REMINDER_TIMEZONE`
- `CRON_SECRET`

Run the backend from the repository root:

```bash
set -a
source backend/.env
set +a
.venv/bin/uvicorn backend.app.main:app --reload --app-dir .
```

Run the frontend from `frontend/`:

```bash
npm run dev
```

## Tests

Backend:

```bash
.venv/bin/python -m pytest backend/tests -q
```

Frontend:

```bash
npm test
```

## Supabase schema

Run this SQL in your Supabase SQL editor before starting the backend:

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

## Reminder emails

The backend includes a reminder endpoint at `GET /cron/reminders`. It looks for reservations
starting on the next day in `REMINDER_TIMEZONE` and sends a summary email through Resend to the
comma-separated recipients in `REMINDER_RECIPIENTS`.

For the backend Vercel project, `backend/vercel.json` configures a daily cron job:

```json
{
  "crons": [
    {
      "path": "/cron/reminders",
      "schedule": "0 7 * * *"
    }
  ]
}
```

Important: Vercel cron expressions run in UTC, and on the Hobby plan daily jobs only have hourly
precision. The current `0 7 * * *` schedule is the best free approximation for a 09:00 send while
Europe/Madrid is on daylight saving time. If you need an exact 09:00 Europe/Madrid reminder
year-round, Vercel Hobby is not precise enough; this daily job is the free approximation path.
