# BarrierGuard: SIF Precursor Intelligence Engine

> **Smart India Hackathon Problem Statement 26165 — Oil India Limited (OIL)**  
> *AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors in Safety Incident Narratives*

---

## Target Hosting Architecture

```
                    INTERNET
                       |
          ┌────────────┴────────────┐
          ↓                         ↓
     VERCEL WEB                EXPO EAS
     React + Vite              Mobile App
          |                         |
          | HTTPS REST API          |
          └────────────┬────────────┘
                       ↓
                 RENDER BACKEND
                  FastAPI API
                       |
                       ↓
                NEON POSTGRESQL
                       |
                       ↓
                 AI / NLP ENGINE
```

| Component | Target Platform | Tech Stack | Production URL / Build |
| :--- | :--- | :--- | :--- |
| **Web Dashboard** | **Vercel** | React 19, Vite, Tailwind CSS | `https://<your-vercel-domain>.vercel.app` |
| **Backend API** | **Render** | Python 3.11, FastAPI, Uvicorn | `https://<your-backend-service>.onrender.com` |
| **Database** | **Neon** | Serverless PostgreSQL 16 (SSL) | `postgresql://<user>:<pwd>@<ep>.neon.tech/barrierguard` |
| **Mobile App** | **Expo / EAS** | React Native, Expo SDK 57 | Android APK / AAB via EAS |

---

## 🚀 Production Deployment Runbook

### Step 1: Database Setup (Neon PostgreSQL)
1. Go to [Neon Console](https://neon.tech/) and create a new project named `barrierguard`.
2. Copy the PostgreSQL connection string from the Neon dashboard (ensure `sslmode=require` is present):
   ```
   postgresql://<user>:<password>@<ep-xyz>.neon.tech/barrierguard?sslmode=require
   ```
3. No manual table creation is needed: BarrierGuard automatically creates schemas and seeds demo data on first boot.

---

### Step 2: Backend Deployment (Render)
1. Sign in to [Render](https://render.com/).
2. Click **New +** $\rightarrow$ **Blueprint** (or **Web Service**).
3. Connect your GitHub repository: `https://github.com/dhruvparashar05/BarrierGuard`.
4. Render will automatically detect [`render.yaml`](render.yaml) and configure:
   - **Runtime:** `Python 3.11.9`
   - **Build Command:** `pip install -r barrierguard/backend/requirements.txt`
   - **Start Command:** `uvicorn barrierguard.backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables in Render:
   - `DATABASE_URL`: Your Neon connection string (from Step 1).
   - `SECRET_KEY`: A secure 32+ character random string.
   - `CORS_ORIGINS`: Your Vercel frontend domain (e.g. `https://barrierguard.vercel.app`) or `*`.
   - `ENVIRONMENT`: `production`
6. Click **Deploy**. When finished, copy your Render backend URL (e.g., `https://barrierguard-api.onrender.com`).
7. Verify health check: `https://<backend-service>.onrender.com/health` $\rightarrow$ `{"status":"healthy"}`.

---

### Step 3: Web Dashboard Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project** and import `https://github.com/dhruvparashar05/BarrierGuard`.
3. In Project Settings:
   - **Root Directory:** `barrierguard/web` (or leave at root; [`vercel.json`](vercel.json) handles monorepo rewrites)
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://barrierguard-api.onrender.com`)
5. Click **Deploy**.
6. Direct routes (`/dashboard`, `/reports`, `/patterns`, `/login`) are automatically handled via [`vercel.json`](barrierguard/web/vercel.json).

---

### Step 4: Mobile App Build (Expo EAS)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Navigate to mobile directory and login:
   ```bash
   cd barrierguard/mobile
   eas login
   ```
3. Set production API URL:
   ```bash
   # Add to barrierguard/mobile/.env:
   EXPO_PUBLIC_API_URL=https://<your-backend-service>.onrender.com
   ```
4. Build standalone installable Android APK:
   ```bash
   eas build --platform android --profile preview
   ```
5. Or build Google Play App Bundle (AAB):
   ```bash
   eas build --platform android --profile production
   ```

---

## 💻 Local Development

### 1. Backend (FastAPI)
```powershell
python -m uvicorn barrierguard.backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Root: `http://127.0.0.1:8000/`
- Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Web Dashboard (React + Vite)
```powershell
cd barrierguard/web
npm run dev
```
- Dashboard: `http://localhost:5173/`

### 3. Mobile App (Expo)
```powershell
cd barrierguard/mobile
npx expo start --web
```

---

## 🔒 Security & Credentials Handling

- All sensitive keys (`DATABASE_URL`, `SECRET_KEY`, `OPENAI_API_KEY`, etc.) are managed strictly through environment variables.
- The `.gitignore` prevents committing `.env`, `.pem`, `.key`, `*.db`, and `node_modules`.
- Refer to [`.env.example`](.env.example) for the full list of configuration variables.
