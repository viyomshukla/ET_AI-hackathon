# Digital Public Safety Intelligence Platform

A hackathon project that uses AI to help fight fraud and improve public
safety, built from three modules that share one backend:

1. **Citizen Fraud Shield** — paste a suspicious message (or upload a
   screenshot) and an AI (Google Gemini) tells you if it's a scam, in plain
   language.
2. **Fraud Network Graph** — visualizes how complaints connect through
   shared phone numbers / bank accounts, revealing fraud rings, with a
   panel that ranks the biggest rings.
3. **Geospatial Crime Dashboard** — a map of India showing where complaints
   are coming from, plus trend/breakdown charts.

Everything below is written for a beginner — follow the steps in order.

## Tech stack

| Piece | Tool | Why |
|---|---|---|
| Frontend | React (Vite) + plain CSS | fast, no framework overhead |
| Backend | Python FastAPI | simple, great docs, easy to deploy free |
| AI | Google Gemini API | generous free tier |
| Database | Supabase (Postgres) | free tier, no server to manage |
| Graph | react-force-graph-2d | renders a network graph in the browser |
| Map | Leaflet.js via react-leaflet | free, no API key needed |

## Project structure

```
backend/
  main.py           - FastAPI app (all API endpoints + CORS + rate limiting)
  db.py             - Supabase client setup
  gemini_client.py  - talks to Google Gemini for Module 1 (text + image)
  graph_utils.py    - pure fraud-ring detection logic for Module 2
  cities.py         - shared list of Indian cities + coordinates
  schema.sql        - run this in Supabase first
  seed.py           - generates ~300 fake complaints for demo data
  tests/            - pytest unit tests (no network calls)
  requirements.txt
  .env.example
frontend/
  src/
    pages/FraudShield.jsx     - Module 1 (chat + screenshot upload)
    pages/NetworkGraph.jsx    - Module 2 (graph + fraud rings panel)
    pages/CrimeMap.jsx        - Module 3 (map + analytics charts)
    components/Navbar.jsx     - nav + dark mode toggle
    components/AnalyticsCharts.jsx - scam-type & trend charts (recharts)
    components/Spinner.jsx    - shared loading indicator
    api.js                    - all fetch() calls to the backend live here
  .env.example
```

---

## Step 1 — Create your Supabase project & table

1. Go to [supabase.com](https://supabase.com) and create a free account + a
   new project (pick any name/password/region).
2. Once the project is ready, open **SQL Editor** in the left sidebar →
   **New query**.
3. Copy the entire contents of [`backend/schema.sql`](backend/schema.sql),
   paste it in, and click **Run**. This creates the `complaints` table.
4. Go to **Project Settings → API**. You'll need two values later:
   - **Project URL** → this is your `SUPABASE_URL`
   - **service_role key** (under "Project API keys") → this is your
     `SUPABASE_KEY`. Keep this secret — it goes in the backend only, never
     in the frontend.

## Step 2 — Get a free Gemini API key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Sign in with a Google account and click **Create API key**. Free tier is
   enough for this project.
3. Copy the key — this is your `GEMINI_API_KEY`.

## Step 3 — Run the backend locally

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# Copy the example env file and fill in your real keys
copy .env.example .env       # Windows
cp .env.example .env         # macOS/Linux
```

Open `backend/.env` and fill in `GEMINI_API_KEY`, `SUPABASE_URL`, and
`SUPABASE_KEY` with the values from Steps 1 & 2.

Generate demo data (only needs to be run once):

```bash
python seed.py
```

Start the API server:

```bash
uvicorn main:app --reload --port 8000
```

Your backend is now running at `http://localhost:8000`. Visit
`http://localhost:8000/docs` to see interactive API docs (FastAPI gives you
this for free).

(Optional) Run the backend's test suite — these are unit tests only, they
don't call Gemini or Supabase, so no `.env` values are needed to run them:

```bash
pytest
```

## Step 4 — Run the frontend locally

Open a **new** terminal (keep the backend running):

```bash
cd frontend
npm install

copy .env.example .env       # Windows
cp .env.example .env         # macOS/Linux
```

The default `.env` already points at `http://localhost:8000`, which matches
the backend from Step 3, so no edits are needed for local dev.

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`) in your browser.
You should see the navbar with three pages: Fraud Shield, Network Graph, and
Crime Map.

---

## Deploying for free

### Backend → Render

1. Push this project to a GitHub repo.
2. Go to [render.com](https://render.com) → **New → Web Service** → connect
   your repo.
3. Set:
   - **Root directory**: `backend`
   - **Build command**: `pip install -r requirements.txt`
   - **Start command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment**, add `GEMINI_API_KEY`, `SUPABASE_URL`,
   `SUPABASE_KEY`, and `FRONTEND_ORIGINS` (set this to your Vercel URL once
   you have it, e.g. `https://your-app.vercel.app`).
5. Deploy. Render gives you a URL like `https://your-app.onrender.com`.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import the
   same GitHub repo.
2. Set **Root directory** to `frontend`. Vercel auto-detects Vite.
3. Add environment variable `VITE_API_URL` = your Render backend URL from
   above.
4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.
5. Go back to Render and update `FRONTEND_ORIGINS` to that Vercel URL, then
   redeploy the backend so CORS allows it.

---

## Advanced features

Beyond the core 3 modules, the app also includes:

- **Screenshot analysis** (Fraud Shield): instead of pasting text, upload a
  JPEG/PNG screenshot of a scam SMS/UPI request/email. Gemini's vision
  support reads the image directly (`POST /analyze-image`). Max 4MB.
- **Fraud ring detection** (Network Graph): the backend groups complaints
  that share a phone number or bank account into "rings"
  (`backend/graph_utils.py`). Bigger dots in the graph mean bigger rings,
  and the "Top Fraud Rings" panel lets you click a ring to highlight just
  its nodes.
- **Analytics charts** (Crime Map): a bar chart of complaints by scam type
  and a 30-day trend line, powered by the free `recharts` library and a new
  `GET /stats` endpoint.
- **Dark mode**: the moon/sun button in the navbar toggles a dark theme and
  remembers your choice (`localStorage`).
- **Rate limiting**: `/analyze` and `/analyze-image` are limited to 10
  requests/minute per IP address (via `slowapi`, in-memory, no external
  service) to protect your free Gemini quota from accidental overuse.

---

## Troubleshooting

- **CORS error in the browser console**: make sure `FRONTEND_ORIGINS` in the
  backend `.env` exactly matches the URL your frontend is running on
  (including `http://` vs `https://`, no trailing slash).
- **"GEMINI_API_KEY is not set" error**: you forgot to create `backend/.env`
  from `.env.example`, or forgot to fill it in.
- **Graph/Map pages are empty**: run `python backend/seed.py` to generate
  demo data, and confirm you ran `schema.sql` in Supabase first.
- **Gemini reply isn't valid JSON**: this is rare since we request JSON mode,
  but if it happens, just try again — occasionally the model needs a retry.
- **"429 Too Many Requests"**: you've hit the 10/minute rate limit on
  `/analyze` or `/analyze-image`. Wait a minute and try again — this exists
  to protect your free Gemini quota.
