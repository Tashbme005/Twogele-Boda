# Twogele Boda Backend

FastAPI backend for **Twogele Boda** — a Gemma 4 multimodal assistant for Kampala boda riders. It classifies rider input into **SAFETY** reports or **EXPENSE** ledger entries using the Google AI Studio / Gemini API.

---

## Stack

- **FastAPI** — HTTP API + CORS
- **google-genai** — Gemma 4 (`gemma-4-26b-a4b-it`)
- **SQLAlchemy + Neon Postgres** — persist rider dispatches (`dispatch_logs`)
- **python-dotenv** — local secrets from `.env`

---

## Project layout

```text
twogele-boda-backend/
├── server.py                 # FastAPI app, CORS, /health + /chat + /history
├── requirements.txt          # Python dependencies
├── .env.example              # Env template (copy to .env)
├── db/
│   ├── models.py             # DispatchLog table
│   └── repository.py         # Save / list helpers
├── agent/
│   ├── twogele_prompt.py     # System prompt (SAFETY + EXPENSE)
│   └── model_engine.py       # Google AI Studio SDK wrapper
└── tests/
    ├── test_cases.py         # Sample SAFETY / EXPENSE prompts
    └── run_prompt_tests.py   # Live prompt test runner
```

---

## Prerequisites

- Python **3.12+**
- A Google AI Studio API key: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## Setup

```bash
cd twogele-boda-backend

# Create and activate a virtualenv
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure secrets
cp .env.example .env
```

Edit `.env` and set your key:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8081
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require
```

> Never commit `.env`. Only `.env.example` belongs in git.
>
> Get a Neon connection string from the [Neon console](https://console.neon.tech). Prefer `postgresql+psycopg://` for SQLAlchemy + psycopg3.

---

## Run the API

```bash
source .venv/bin/activate
python server.py
```

Server starts at **http://localhost:8000**

| Resource | URL |
|----------|-----|
| Health | http://localhost:8000/health |
| History | http://localhost:8000/history |
| Interactive docs | http://localhost:8000/docs |
| OpenAPI schema | http://localhost:8000/openapi.json |

---

## API endpoints

### `GET /health`

```bash
curl http://localhost:8000/health
```

### `POST /chat`

JSON text chat.

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "There is a huge pothole near Clock Tower on Entebbe Road.",
    "track": "safer_rides"
  }'
```

Optional `track` values:

- `safer_rides` / `safety` / `incident` — force SAFETY handling
- `livelihoods` / `ledger` / `bookkeeping` / `finance` — force EXPENSE handling
- omit — let the model classify

Each successful `/chat` call is saved to Neon (`dispatch_logs`) and returns `id` + `category`.

### `GET /history`

List saved rider dispatches (newest first).

```bash
curl "http://localhost:8000/history?limit=20"
curl "http://localhost:8000/history?category=expense&limit=10"
```

Query params: `limit` (1–200), `category` (`safety` | `expense` | `unknown`), `rider_id`.

### `POST /chat/multimodal`

Text and/or audio (`multipart/form-data`).

```bash
curl -X POST http://localhost:8000/chat/multimodal \
  -F 'message=Mwana accident ebadde ku Jinja Road near Nakawa stage' \
  -F 'track=safer_rides' \
  -F 'audio=@recording.wav'
```

### Response shape

```json
{
  "model": "gemma-4-26b-a4b-it",
  "thinking": "optional reasoning text",
  "response": "final rider-facing output",
  "raw": "full model output including thinking tags"
}
```

---

## Agent behaviour

The system prompt in `agent/twogele_prompt.py` asks Gemma 4 to:

1. Reason inside `<|think|> ... </|think|>` tokens
2. Route to one category:

### SAFETY

Structured fields:

- Hazard Type
- Location
- Urgency (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`)
- Responsible Body (e.g. KCCA, Uganda Traffic Police, EMR)

### EXPENSE

JSON ledger object:

```json
{
  "Fuel expenses": 25000,
  "Daily expenses": null,
  "Income saved": 40000
}
```

Plus investment suggestions for savings when relevant.

Generation settings (from Google AI Studio) live in `agent/model_engine.py`: temperature `0.6`, top_p `0.85`, thinking level `HIGH`, safety filters, and Google Search tool.

---

## Prompt tests

Live cases that call the real model (uses API quota):

```bash
source .venv/bin/activate

# List all prompts
python -m tests.run_prompt_tests --list

# Run everything
python -m tests.run_prompt_tests

# Filter
python -m tests.run_prompt_tests --category SAFETY
python -m tests.run_prompt_tests --category EXPENSE
python -m tests.run_prompt_tests --id expense_fuel_english

# Limit + retries
python -m tests.run_prompt_tests --limit 2 --retries 3
```

Add new prompts in `tests/test_cases.py`.

---

## Deploy on Render

All Render files live in this folder: `Procfile`, `runtime.txt`, `render.yaml`, `RENDER.md`.

### Dashboard settings

| Field | Value |
|--------|--------|
| Source | This backend folder (or set **Root Directory** to `twogele-boda-backend`) |
| Branch | `frontend` |
| Language | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

### Environment variables

| Name | Example |
|------|---------|
| `GEMINI_API_KEY` | your Google AI Studio key |
| `GEMMA_MODEL` | `gemma-4-26b-a4b-it` |
| `DATABASE_URL` | Neon URL (`postgresql+psycopg://...` or `postgresql://...`) |
| `CORS_ORIGINS` | `*` for first test, then your Vercel URL |

After deploy, open `https://YOUR-SERVICE.onrender.com/health`.

Free instances sleep when idle — the first request after sleep can take up to a minute.

See `RENDER.md` for a short cheat sheet.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `GEMINI_API_KEY is not set` | Copy `.env.example` → `.env` and add your key |
| `502` / `500 INTERNAL` from Google | Transient API error — retry; the test runner retries automatically |
| CORS errors from the frontend | Add your frontend origin to `CORS_ORIGINS` in `.env` |
| Import errors | Activate `.venv` and reinstall: `pip install -r requirements.txt` |
| Render uses wrong start command | Must be `uvicorn server:app --host 0.0.0.0 --port $PORT` (not gunicorn/wsgi) |

---

## Quick checklist

1. [ ] `pip install -r requirements.txt`
2. [ ] `.env` created with a valid `GEMINI_API_KEY` and `DATABASE_URL`
3. [ ] `python server.py` → `/health` returns `ok`
4. [ ] `python -m tests.run_prompt_tests --limit 2` passes
