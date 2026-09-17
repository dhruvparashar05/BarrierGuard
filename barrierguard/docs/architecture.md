# BarrierGuard — System Architecture Documentation

**Smart India Hackathon Problem Statement 26165**  
**Organization:** Oil India Limited (OIL)  
**Project Title:** SIF Precursor Intelligence Engine  

---

## 1. High-Level System Architecture

The BarrierGuard platform connects operational field reporting (from both desktop workstations and field mobile devices) to a unified AI/NLP intelligence pipeline and a robust data store.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer"]
        Web["Web Enterprise Dashboard\n(React + TypeScript + Vite + Tailwind)"]
        Mobile["Field Mobile App\n(React Native + Expo)"]
    end

    subgraph APILayer ["FastAPI REST Gateway"]
        Auth["/api/auth\n(JWT Authentication)"]
        ReportsAPI["/api/reports\n(CRUD & Filters)"]
        AnalyzeAPI["/api/reports/analyze\n(Live NLP Inference)"]
        PatternsAPI["/api/patterns\n(Systemic Clustering)"]
        RulesAPI["/api/life-saving-rules\n(IOGP Rules)"]
        SitesAPI["/api/analytics/sites\n(Asset Heatmaps)"]
        AlertsAPI["/api/alerts\n(Alarms & Acknowledge)"]
        InterventionsAPI["/api/interventions\n(5-Stage Remediation)"]
    end

    subgraph MLEngine ["BarrierGuard ML & NLP Intelligence Engine"]
        Classifier["SIF Classifier\n(TF-IDF + Calibrated Logistic / SGD)"]
        RuleMatcher["IOGP Rule Matcher\n(Semantic Cosine Similarity)"]
        Extractor["Hybrid Precursor Extractor\n(Domain Heuristics + LLM Abstraction)"]
        Explainer["XAI Explainability Engine\n(Causal Feature Attribution)"]
        SimilarityEngine["Vector Similarity Engine\n(Cosine Embeddings / pgvector)"]
        PatternDetector["Pattern Clustering Detector\n(Multi-Dimensional Combinations)"]
    end

    subgraph DataLayer ["Data & Persistence Layer"]
        DB[("PostgreSQL + pgvector\n(Fallback: SQLite for Demo)")]
        KB[("IOGP Life-Saving Rules\nKnowledge Base")]
        SyntheticRepo[("OIL Operational Dataset\n(750+ Synthetic Reports)")]
    end

    ClientLayer --> APILayer
    APILayer --> MLEngine
    MLEngine --> DataLayer
    APILayer --> DataLayer
```

---

## 2. Real-Time Safety NLP Inference Pipeline

When a safety report or near-miss narrative is ingested, it flows through a sequential pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor User as HSE Field Officer
    participant API as FastAPI Backend
    participant CLF as SIF Classifier
    participant RUL as IOGP Rule Matcher
    participant EXT as Precursor Extractor
    participant XAI as Explainability Engine
    participant SIM as Similarity Engine
    participant DB as Central Database

    User->>API: Submit Report Narrative
    API->>CLF: Predict SIF Potential & Risk Score (0-1)
    CLF-->>API: SIF: True, Score: 0.88, Level: HIGH
    API->>RUL: Match against 10 IOGP Life-Saving Rules
    RUL-->>API: Top Rule: Energy Isolation (Conf: 0.92)
    API->>EXT: Extract structured precursors
    EXT-->>API: Activity, Hazard, Barrier Failure, Equipment
    API->>XAI: Generate Feature Attribution
    XAI-->>API: Human-readable causal drivers
    API->>SIM: Query similar historical incidents
    SIM-->>API: Top 4 similar incident reports
    API->>DB: Store report + predictions + audit log
    API-->>User: Structured AI Report Analysis
```

---

## 3. Human-in-the-Loop & Model Improvement Feedback Loop

BarrierGuard enforces human-in-the-loop supervision. The AI recommends classifications, while HSE Officers hold ultimate verification authority:

```mermaid
stateDiagram-v2
    [*] --> ModelInference: Ingest Safety Report
    ModelInference --> AIPredictionGenerated: SIF Potential & Precursors Detected
    AIPredictionGenerated --> HSEAudit: Flagged in Incident Dashboard
    state HSEAudit {
        [*] --> ReviewDetails
        ReviewDetails --> ConfirmFlag: AI Verified by Field Lead
        ReviewDetails --> OverrideLabel: Non-SIF Override / Barrier Reclassified
    }
    ConfirmFlag --> AuditLog: Timestamped with Officer Credentials
    OverrideLabel --> ModelRetrainingPool: Feedback Stored in Continuous Dataset
    ModelRetrainingPool --> RetrainPipeline: Periodic Retraining with Human-Labeled Truth
    RetrainPipeline --> ModelInference: Deployed Model Weights Updated
```

---

## 4. Multi-Dimensional Precursor Pattern Detection

The Primary USP of BarrierGuard is detecting recurring combinations across seemingly disconnected near-miss reports before a fatality occurs:

```mermaid
flowchart LR
    R1["Near-Miss 102\n(Site A)"] --> ClusterEngine["Pattern Detection Engine"]
    R2["Near-Miss 148\n(Site A)"] --> ClusterEngine
    R3["Unsafe Act 209\n(Site A)"] --> ClusterEngine

    ClusterEngine --> Pattern["🚨 RECURRING SYSTEMIC PATTERN:\nPump Maintenance\n+ Isolation Not Verified\n+ Energy Isolation\n+ Site A - Duliajan"]

    Pattern --> Metric["128 Occurrences\n96.5% SIF Ratio\nTrend: Increasing"]
    Metric --> Alert["Auto-Trigger Critical Alert\n& Mandate LOTO Stand-Down"]
```
