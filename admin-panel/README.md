# YORK — Employee Admin Panel

A fully client-side React admin dashboard for employee management. No backend required — all data (accounts, employees, notifications, settings, theme) lives in your browser's LocalStorage.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

On first run, sign up for an account, then log in — the app seeds 13 demo employees automatically so the dashboard and charts have data to show.

## Tech stack

- React 18 + Vite
- React Router DOM (routing + protected routes)
- Recharts (dashboard charts)
- lucide-react (icons)
- Plain CSS with design tokens (light/dark theme via CSS variables)

## Project structure

```
src/
  components/   Reusable UI building blocks
  pages/        Route-level views
  layouts/      AdminLayout (sidebar + navbar shell)
  context/      Auth, Theme, Data (employees/notifications/settings), Toast
  routes/       ProtectedRoute
  utils/        LocalStorage helpers, validation
  data/         Demo employee generator
```

## Notes

- All LocalStorage access goes through helper functions in `src/utils/storage.js` — never raw `localStorage` calls scattered through components.
- Demo data seeds only once (`YORK_seeded` flag) and never overwrites existing data on refresh.
- Dark mode, notification preferences, and your session all persist across refreshes.
