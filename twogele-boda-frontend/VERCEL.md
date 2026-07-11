# Deploy Twogele Boda frontend on Vercel

Vite + React SPA. Backend stays on Render (`https://twogele-boda-backend.onrender.com`).

## One-time setup

1. Push this repo to GitHub (if it is not already).
2. In [Vercel](https://vercel.com/new) → **Add New Project** → import the repo.
3. Set **Root Directory** to `twogele-boda-frontend` (Important — monorepo).
4. Framework Preset should detect **Vite**. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add environment variables (Production + Preview):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://twogele-boda-backend.onrender.com` |
| `VITE_NEON_AUTH_URL` | Neon Auth Base URL (Neon → Auth → Configuration) |

6. Deploy.

`vercel.json` in this folder handles SPA routing so `/login`, `/signup`, `/app/*` work on refresh.

## After you have a Vercel URL

### 1. Render CORS

In the Render service env, set (or append) your frontend origin:

```env
CORS_ORIGINS=http://localhost:5173,https://twogele-boda.vercel.app
```

Production frontend: [https://twogele-boda.vercel.app/](https://twogele-boda.vercel.app/)

Redeploy the backend (or restart) so CORS picks up the change.

If you use a custom domain later, add that origin too.

### 2. Neon Auth trusted origins

In Neon console → **Auth** → allow your Vercel URL (and custom domain) as a trusted / redirect origin so login and signup work in production.

## CLI (optional)

From the repo root:

```bash
cd twogele-boda-frontend
npx vercel
```

Link the project, then:

```bash
npx vercel env add VITE_API_URL
npx vercel env add VITE_NEON_AUTH_URL
npx vercel --prod
```

## Local check before deploy

```bash
cd twogele-boda-frontend
npm install
npm run build
npm run preview
```

Open the preview URL and confirm landing, login, and `/app` routes load.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page / 404 on `/login` | Root Directory must be `twogele-boda-frontend`; `vercel.json` rewrites must be present |
| API CORS errors | Add the exact Vercel origin to Render `CORS_ORIGINS` |
| Auth “not configured” | Set `VITE_NEON_AUTH_URL` in Vercel env and **redeploy** (Vite bakes env at build time) |
| Still hitting localhost API | Env var missing or wrong; rebuild after changing `VITE_*` vars |
