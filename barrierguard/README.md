# BarrierGuard: SIF Precursor Intelligence Engine

> **Smart India Hackathon Problem Statement 26165**  
> **Organization:** Oil India Limited (OIL)  
> **Tagline:** *"Turning Safety Reports into Proactive Fatal-Risk Prevention"*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Web-React_19_TypeScript-61DAFB.svg)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind_v3-38B2AC.svg)](https://tailwindcss.com)
[![Expo](https://img.shields.io/badge/Mobile-React_Native_Expo-000020.svg)](https://expo.dev)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Project Overview

In heavy upstream oil and gas operations at **Oil India Limited (OIL)**, thousands of safety observations—Unsafe Acts, Unsafe Conditions, and Near-Miss reports—are logged across drilling rigs, production installations, crude pump stations, and pipeline corridors. Historically, high-potential fatal precursors remain buried inside routine low-risk slip/trip narratives until a catastrophic incident occurs.

**BarrierGuard** is an enterprise AI/NLP intelligence engine that:
1. **Classifies SIF Potential**: Accurately distinguishes Serious Injury & Fatality (SIF) precursors from routine low-risk observations.
2. **Calculates Risk Scores**: Assigns a transparent 0–1 risk index and priority (High, Medium, Low).
3. **Maps IOGP Life-Saving Rules**: Automatically maps narratives to 10 international IOGP Life-Saving Rules (Energy Isolation, Confined Space, Working at Height, Hot Work, Line of Fire, etc.).
4. **Extracts Structured Precursors**: Converts unstructured text into structured entities (*Activity, Location, Equipment, Hazard, Barrier Failure, Unsafe Act, Consequence*).
5. **Detects Systemic Failure Patterns (USP)**: Uncovers hidden recurring combinations across sites (e.g. *Pump Maintenance + Isolation Not Verified at Site A*).
6. **Delivers Explainable AI (XAI)**: Explicitly explains *why* a report was flagged using concrete causal features.
7. **Maintains Human-in-the-Loop Supervision**: Allows HSE Officers to audit, accept, or override AI predictions, closing the loop for continuous model retraining.
8. **Field Mobile Access**: Provides a dedicated field-friendly React Native/Expo app sharing the same backend.

> [!NOTE]
> **Prototype Demonstration Notice:** This system is populated with a synthetic operational dataset representing Oil India Limited facilities (Duliajan, Moran, Digboi, Jorhat, Naharkatiya). No confidential OIL production data is used.

---

## 2. Technology Stack

- **Web Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Mobile App:** React Native, Expo, TypeScript, Expo Web / Expo Go
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy
- **Database:** PostgreSQL + pgvector (with automatic zero-setup SQLite fallback for instant local evaluation)
- **ML / NLP:** scikit-learn (TF-IDF + Calibrated Classifier), Cosine Semantic Matcher, Custom Oil & Gas Entity Extractor
- **LLM Abstraction Layer:** Multi-provider interface supporting Offline Rule-Based NLP, OpenAI-compatible APIs, and Google Gemini
- **Deployment:** Docker, Docker Compose

---

## 3. Quick Start Guide (Zero-Setup Host Mode)

The prototype runs natively on Windows, macOS, or Linux without requiring external database servers or third-party cloud API keys.

### Step 1: Clone or Navigate to Directory
```powershell
cd "c:\Users\Dhruv Parashar\Desktop\OilProject\barrierguard"
```

### Step 2: Start the FastAPI Backend
```powershell
# From workspace root or barrierguard directory:
python -m uvicorn barrierguard.backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The database automatically creates tables and seeds 750 realistic OIL reports, patterns, and alerts on first boot.*

- **Backend API URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

### Step 3: Start the Web Dashboard
Open a second terminal window:
```powershell
cd barrierguard\web
npm run dev
```
- **Web Dashboard URL:** `http://localhost:5173` (or port shown in terminal)

### Step 4: Preview Field Mobile App
Open a third terminal window:
```powershell
cd barrierguard\mobile
npx expo start --web
```
- **Mobile Field App URL:** `http://localhost:8081`

---

## 4. Docker Compose Deployment

If you prefer containerized deployment with PostgreSQL and pgvector:
```bash
docker-compose up --build
```
- **Web UI:** `http://localhost:3000`
- **FastAPI Backend:** `http://localhost:8000`
- **PostgreSQL Database:** `localhost:5432`

---

## 5. Demo Credentials

Judges and evaluators can log in immediately with pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **HSE Analyst** | `demo@barrierguard.local` | `Demo@123456` | Analyze reports, review SIF flags, view patterns |
| **HSE Manager** | `manager@barrierguard.local` | `Demo@123456` | Assign HSE interventions, review site metrics |
| **Administrator** | `admin@barrierguard.local` | `Demo@123456` | System configuration, threshold adjustments |

---

## 6. Critical Hackathon Judge Evaluation Walkthrough

Follow this step-by-step flow to review all core features:

1. **Login & Dashboard Overview (`/dashboard`)**:
   - Inspect the 4 KPI cards: **750 Total Reports**, **195 SIF-Potential (26%)**, **12 High-Risk Patterns**, **5 Monitored Sites**.
   - Review the **SIF-Potential Trend Area Chart** and **IOGP Rules Donut Chart**.
   - Filter by OIL facility (e.g., select *Site A - Duliajan* or *Site B - Moran*) and observe real-time recalculation.

2. **Reports Database & Multi-Facet Filtering (`/reports`)**:
   - Filter by **SIF-Potential Only** or **Energy Isolation**.
   - Search for keywords like *"pump"*, *"voltage"*, or *"confined space"*.
   - Click any report (e.g. `OIL-REP-2025-0001`) to open the deep-dive view.

3. **Report Analysis Page (`/reports/:id`)**:
   - Inspect the **FLAGGED AS SIF-POTENTIAL** banner with **Confidence Score** and **Risk Score**.
   - Review the extracted structured precursors (*Activity, Hazard, Barrier Failure, Potential Consequence*).
   - Read the **Explainable AI** section ("*Why was this report flagged?*").
   - Test the **Human-in-the-Loop** buttons: click *"Override Non-SIF"* or *"Confirm SIF"* and observe the audit trail update.
   - Click a **Similar Report** from the pgvector/cosine match list.

4. **Interactive NLP Sandbox (`/analyze`)**:
   - Click one of the preset scenario chips (e.g. *Pump Isolation Bypass* or *Confined Space Without Gas Test*).
   - Click **"Analyze Report"**.
   - Observe the live model inference classify SIF status, map the IOGP Life-Saving Rule, and extract precursors in under 150ms.
   - Click **"Save & Submit Report"** to persist it into the database.

5. **Systemic Pattern Detection — The Primary USP (`/patterns`)**:
   - Review multi-dimensional recurring clusters:
     - `Pump Maintenance` + `Isolation Not Verified` + `Energy Isolation` + `Site A - Duliajan`
     - `Vessel Entry` + `Missing Gas Testing` + `Confined Space` + `Site B - Moran`
   - Observe occurrence counts, SIF ratios, risk tiers, and recommended proactive interventions.

6. **Site Analytics & Heatmaps (`/analytics/sites`)**:
   - Compare precursor density across Duliajan, Moran, Digboi, Jorhat, and Naharkatiya.

7. **Field Mobile Application (`mobile/`)**:
   - Switch to the mobile interface.
   - Tap **"+ New Safety Observation"**, select an activity and site, type a near-miss narrative, and tap **"Analyze with AI"**.
   - Verify that the mobile app displays the same AI prediction and shares the unified FastAPI backend.

---

## 7. Model Architecture & Pipeline Details

### A. SIF Classifier
- **Representation:** N-gram Sublinear TF-IDF (1-3 ngrams) with 5,000 maximum vocabulary features.
- **Model:** L2-Regularized Balanced Logistic Regression calibrated for fatal-precursor sensitivity.
- **Safety Ensemble Booster:** Domain rules ensure that high-energy hazard indicators (e.g. 440V, H2S, falls from 20m elevation) combined with barrier failures trigger SIF-potential with high reliability.
- **Evaluation:** 100% ROC-AUC on synthetic validation set.

### B. IOGP Life-Saving Rule Matcher
- Embeds standard IOGP Report 459 definitions, mandatory barriers, and oilfield keywords.
- Computes cosine similarity vector matches to rank the top 3 relevant rules with confidence scores.

### C. Precursor Entity Extractor
- Hybrid architecture utilizing an entity rule-matcher alongside a pluggable multi-provider LLM abstraction layer (`MockRuleBasedProvider`, `OpenAICompatibleProvider`, `GeminiProvider`).
- Guarantees 100% deterministic operation offline while allowing drop-in cloud LLM enhancements when API keys are configured in `.env`.

---

## 8. Directory Structure

```
/barrierguard
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint & router mounts
│   │   ├── config.py         # App settings, DB URL, LLM configurations
│   │   ├── database.py       # SQLAlchemy engine & session management
│   │   ├── models/           # DB entities (Report, Precursor, Pattern, Alert, User, etc.)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API endpoints (reports, dashboard, patterns, rules, etc.)
│   │   └── services/         # Business logic & background jobs
│   ├── Dockerfile
│   └── requirements.txt
├── ml/                       # Machine Learning & NLP Pipeline
│   ├── classifier/           # SIF Classifier (scikit-learn + baseline + fallback)
│   ├── embeddings/           # Sentence embeddings & cosine vector search
│   ├── rule_mapping/         # IOGP Life-Saving Rules semantic matcher
│   ├── extraction/           # Hybrid Precursor entity extractor & LLM abstraction
│   ├── explainability/       # Feature attribution & XAI explanation generator
│   └── patterns/             # Pattern detection & clustering algorithm
├── data/                     # Synthetic Datasets & Knowledge Base
│   ├── synthetic_reports.json # 750 synthetic OIL incident/near-miss reports
│   ├── iogp_rules.json       # Formal IOGP 10 Life-Saving Rules definitions & keywords
│   └── generate_dataset.py   # Dataset generator script
├── web/                      # React + Vite + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/       # Layouts, Sidebar, MetricCards, Badges
│   │   ├── pages/            # Dashboard, Reports, Detail, Patterns, Sites, Rules, Alerts
│   │   ├── services/         # Axios API clients
│   │   ├── types/            # TypeScript data models
│   │   └── App.tsx           # Router and Navigation
│   ├── tailwind.config.js    # Enterprise color palette (Navy, Blue, Risk indicators)
│   ├── Dockerfile
│   └── package.json
├── mobile/                   # React Native + Expo Mobile Field App
│   ├── src/
│   │   ├── screens/          # HomeScreen, NewReportScreen, ReportsListScreen, AlertsScreen
│   │   └── services/         # Mobile API client sharing the same FastAPI backend
│   ├── app.json
│   └── package.json
├── database/                 # Schema definitions & migrations
│   └── schema.sql
├── docs/                     # Architectural documentation
│   ├── architecture.md       # Mermaid architecture diagrams & pipeline specs
│   └── api_reference.md      # REST API specification
├── docker-compose.yml        # Multi-container orchestration
├── README.md                 # Complete project documentation
└── .env.example
```

---

## 9. Current Status & Production Roadmap

### Implemented in Prototype:
- [x] Full Monorepo architecture with clean separation of concerns
- [x] FastAPI REST API with 15+ functional endpoints
- [x] SIF classification with 100% test ROC-AUC
- [x] IOGP 10 Life-Saving Rule semantic mapping
- [x] Structured Precursor extraction (Activity, Hazard, Barrier, Equipment, Consequence)
- [x] Explainable AI (XAI) causal driver generator
- [x] Multi-dimensional systemic precursor pattern clustering (Primary USP)
- [x] Human-in-the-loop review and audit logging
- [x] Full Enterprise Web Dashboard (matching OIL enterprise aesthetic)
- [x] React Native Expo mobile field application with live inference
- [x] 750 realistic synthetic OIL operational safety reports

### Production Roadmap:
- [ ] Ingest live OIL SAP-HSE and E-Permit to Work (PTW) enterprise database feeds.
- [ ] Connect with in-vehicle monitoring system (IVMS) telemetry for real-time bowser speed tracking.
- [ ] Integrate local fine-tuned Hindi/Assamese multilingual NLP models for regional field speech-to-text observations.
- [ ] Automated weekly systemic safety risk digest email delivery to Field Station Managers.
