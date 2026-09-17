import sys
from pathlib import Path

# Add project root to sys.path so barrierguard package is discoverable
project_root = Path(__file__).resolve().parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .services.seed_service import seed_database_if_empty

# Routers
from .routers import auth, dashboard, reports, analyze, patterns, sites, rules, alerts, interventions

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI/NLP Engine to Detect Serious Injury & Fatality (SIF) Precursors in OIL Safety Reports",
    version="1.0.0"
)

# CORS middleware for Web and Mobile React Native apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # 1. Create database schema
    Base.metadata.create_all(bind=engine)

    # 2. Seed initial synthetic data if empty
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(analyze.router, prefix=settings.API_PREFIX)
app.include_router(patterns.router, prefix=settings.API_PREFIX)
app.include_router(sites.router, prefix=settings.API_PREFIX)
app.include_router(rules.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(interventions.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": "BarrierGuard",
        "tagline": "Turning Safety Reports into Proactive Fatal-Risk Prevention",
        "client": "Oil India Limited (OIL)",
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX,
        "demo_user": "demo@barrierguard.local"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "BarrierGuard SIF Precursor Intelligence Engine"}
