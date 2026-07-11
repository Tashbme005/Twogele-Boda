# Twogele Boda Frontend

React + Vite rider portal (Stitch **Warm Urban Transit**).

## Screens

- **Landing / Login / Sign up** — public marketing + Neon Auth
- **Dashboard** — Smart Dispatch & Ledger via Gemma `/chat`
- **Emergency Dispatch** — hazard map + alerts + contacts
- **Financial Insights** — earnings, fuel, activity
- **Wealth Planner** — SACCO / investment suggestions
- **Settings** — language, status, logout

## Run locally

```bash
cd twogele-boda-frontend
cp .env.example .env   # fill VITE_API_URL + VITE_NEON_AUTH_URL
npm install
npm run dev
```

Open http://localhost:5173

Backend (Render or local):

```bash
cd ../twogele-boda-backend
source .venv/bin/activate
python server.py
```

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | FastAPI base URL (Render in prod) |
| `VITE_NEON_AUTH_URL` | Neon Auth Base URL |

Vite inlines `VITE_*` at **build** time — change them in Vercel and redeploy.

## Deploy on Vercel

See **[VERCEL.md](./VERCEL.md)** for the full checklist (root directory, env vars, CORS, Neon Auth).

Quick settings:

| Setting | Value |
|---------|--------|
| Root Directory | `twogele-boda-frontend` |
| Build | `npm run build` |
| Output | `dist` |
| Framework | Vite |
