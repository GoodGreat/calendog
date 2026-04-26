# CalenDog

CalenDog is a minimalist dog sitting reservation calendar. It gives a single-page monthly view where reservations can be added and reviewed as continuous multi-day bars, with separate styling for Rover and private bookings.

## Stack

- Backend: Python, FastAPI
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
    reservations.json
  frontend/
    src/
```

## Backend

The FastAPI backend provides:

- `GET /reservations`
- `POST /reservations`

Reservations are persisted in `backend/reservations.json`.

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

Run the backend from the repository root:

```bash
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
