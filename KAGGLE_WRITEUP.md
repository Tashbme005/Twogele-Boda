# Twogele Boda: AI-Powered Safety Triage & Financial Bookkeeping Gateway

**Subtitle:** A unified Gemma 4 conversational assistant managing incident dispatch and structural ledger bookkeeping for Kampala’s boda boda ecosystem.

**Track:** Boda Livelihoods *(covers both Track 1: Safer Rides and Track 3: Boda Livelihoods)*

---

## 1. Problem Statement & Kampala Context

Kampala’s boda boda riders keep the city moving, yet they face severe daily volatility: unpredictable road infrastructure, high accident rates, and unmapped, fluid cash flows. Existing tech fails because it expects a busy rider to switch between fragmented, complex apps while operating a motorcycle.

**Twogele Boda** removes that friction with a **single conversational endpoint**. Whether a rider speaks a frantic report about a collision or logs evening fuel costs in raw street slang—mixed English, Luganda, Kiswahili, and code-switching shortcuts like `22k`—one AI assistant handles the full pipeline: understand → reason → structure → act.

---

## 2. Gemma 4 Technical Architecture & Integration

Twogele Boda uses **Gemma 4** (`gemma-4-26b-a4b-it`) as its multi-task reasoning engine via the **Google Gen AI SDK** (Google AI Studio). We avoid brittle keyword parsing: raw rider text (or browser speech-to-text transcripts) enters a strict two-stage execution pipeline.

```text
                  ┌──► INPUT: "Mwana, heavy floods at Clock Tower!"
                  │
          [ GEMMA 4 ENGINE ]
    Natively processes slang / Luganda / Kiswahili
                  │
                  ▼
       ⚙️ NATIVE REASONING PHASE
     Wrapped in <|think|> tokens
                  │
         ┌────────┴────────┐
         ▼                 ▼
  [ CATEGORY 1 ]      [ CATEGORY 2 ]
   SAFETY TRIAGE       EXPENSE LEDGER
  Structures data     Generates strict JSON
  & maps authority    & investment options
```

### Stack (built & deployed)

| Layer | Tech |
|-------|------|
| Model | Gemma 4 via Google AI Studio |
| Backend | FastAPI + structured system prompt |
| Data | Neon Postgres (dispatch / ledger history) |
| Auth | Neon Auth (email signup / login) |
| Frontend | React + Vite rider portal |
| Deploy | Backend on Render · Frontend on Vercel |

### Advanced prompt engineering

1. **Hidden thinking phase** — We use Gemma 4’s chain-of-thought inside `<|think|>` blocks so the model can translate slang (*mwana*, *panya*, *stage*) and Luganda phrasing into clean English metadata **before** emitting the rider-facing fields.
2. **Deterministic structured JSON** — For financial inputs, Gemma isolates numbers (e.g. `25k` → `25000`) and returns a zero-fluff JSON ledger payload (`Fuel expenses`, `Daily expenses`, `Income saved`) ready for storage and UI display.
3. **Language-aware replies** — The app sends a language preference (English / Luganda / Kiswahili); Gemma replies in that language while keeping English parse keys for reliable UI parsing.

---

## 3. Solution Capabilities & Impact Alignment (SDG 11)

### Track 1: Safer Rides (Incident Reporter)

When a hazard or crash is detected, Twogele Boda translates the input into clear professional English, rates urgency (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`), and maps the incident to the responsible body:

- **Kampala Capital City Authority (KCCA)** — potholes, drainage, broken infrastructure  
- **Uganda Traffic Police / Emergency Medical Response** — collisions and active medical emergencies  

Riders also get a danger / demand map view for Kampala stages and known hotspots.

### Track 3: Boda Livelihoods (Smart Bookkeeping & Wealth Planning)

For ledger inputs, the model structures fuel, daily costs, and savings into a tracking schema. To support longer-term livelihood security, the UI surfaces:

- a **30-day savings projection** from today’s saved amount  
- contextual local avenues such as **boda SACCOs**, **MTN / Airtel Money** savings, and government save plans  

One-tap **test prompts** on the dashboard let judges and riders demo both SAFETY and EXPENSE paths without typing.

**SDG 11 (Sustainable Cities & Communities):** safer urban mobility reporting + more resilient informal livelihoods for the workers who power Kampala’s transport layer.

---

## 4. Challenges Overcome & Safety Guardrails

**1-day sprint constraints.** We shipped a production-shaped split: React frontend + FastAPI Gemma backend, with Neon Auth, Neon Postgres history, CORS for the live Vercel origin, and EN / LG / SW UI copy.

**Multimodal without overclaiming.** Gemma 4 26B text path does not accept raw audio on our API; we use **browser speech recognition** to transcribe voice, then send text to `/chat`—so riders still get a voice-first feel on the road.

**Responsible AI & safety guardrails.** In line with hackathon rules, Twogele Boda includes on-app disclaimers: it is an **assistive logging helper**, not a replacement for official emergency dispatchers or licensed financial professionals.

**Future scaling.** Next: connect the FastAPI endpoint to a **WhatsApp Business API** webhook so riders can send voice notes natively from the apps they already use.

---

## Project Attachments

**Public Code Repository:** https://github.com/Tashbme005/Twogele-Boda  

**Live Demo URL:** https://twogele-boda.vercel.app/  

**API status (optional):** https://twogele-boda-backend.onrender.com/  

> Tip for judges: open the live app → Sign up / Log in → on Home, tap a **test prompt** (e.g. pothole or fuel + save) to see SAFETY triage and EXPENSE JSON in one chat surface.
