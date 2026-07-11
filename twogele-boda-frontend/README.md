# Twogele Boda Frontend

Plain **React + Vite** UI for Twogele Boda. Talks to the FastAPI backend at `http://localhost:8000`.

## Setup

```bash
cd twogele-boda-frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**.

Optional env (create `.env.local`):

```env
VITE_API_URL=http://localhost:8000
```

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

Start the backend first (`twogele-boda-backend`) so `/chat` works.
