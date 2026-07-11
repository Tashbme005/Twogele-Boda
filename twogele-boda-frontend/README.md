# Twogele Boda Frontend

React + Vite Rider Portal UI inspired by the Stitch **Warm Urban Transit** designs.

## Screens

- **Dashboard** — Smart Dispatch & Ledger input wired to Gemma `/chat`
- **Emergency Dispatch** — hazard map + live alerts + contacts
- **Financial Insights** — earnings, fuel, activity
- **Wealth Planner** — SACCO / investment suggestions
- **Settings** — rider preferences

## Run

```bash
cd twogele-boda-frontend
npm install
npm run dev
```

Open http://localhost:5173

Start the backend first:

```bash
cd ../twogele-boda-backend
source .venv/bin/activate
python server.py
```

Optional `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```
