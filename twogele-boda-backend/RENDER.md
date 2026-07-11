# Render deploy — use these values in the dashboard
# Source = this backend folder (Root Directory blank, or twogele-boda-backend)

Name:            Twogele-Boda-Backend
Language:        Python 3
Branch:          frontend
Root Directory:  (leave empty if backend folder is the repo root)
                 OR: twogele-boda-backend  (if connecting the full Twogele-Boda repo)

Build Command:   pip install -r requirements.txt
Start Command:   uvicorn server:app --host 0.0.0.0 --port $PORT

Environment variables (required):
  GEMINI_API_KEY = <your Google AI Studio key>
  GEMMA_MODEL    = gemma-4-26b-a4b-it
  DATABASE_URL   = postgresql+psycopg://...neon.../neondb?sslmode=require
  CORS_ORIGINS   = *   (later: https://your-app.vercel.app)

After deploy, open: https://YOUR-SERVICE.onrender.com/health
