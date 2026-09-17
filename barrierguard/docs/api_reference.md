# BarrierGuard REST API Reference

Base URL: `http://localhost:8000/api`

Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 1. Authentication

### `POST /api/auth/login`
Authenticates an HSE user and issues a JWT token.
- **Request Body:**
  ```json
  {
    "email": "demo@barrierguard.local",
    "password": "Demo@123456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "demo@barrierguard.local",
      "full_name": "A. K. Sharma",
      "role": "HSE Analyst",
      "department": "Corporate HSE Intelligence"
    }
  }
  ```

---

## 2. Dashboard Analytics

### `GET /api/dashboard/summary`
Returns high-level KPI counts, SIF percentage, and trend indicators.
- **Query Parameters:** `site` (optional)
- **Response (200 OK):**
  ```json
  {
    "total_reports": 750,
    "sif_potential_reports": 195,
    "sif_percentage": 26.0,
    "high_risk_patterns": 12,
    "priority_sites_count": 5,
    "recent_alerts_count": 2,
    "sif_trend_direction": "Decreasing (-4.2% MoM)",
    "disclaimer": "BarrierGuard Prototype: Using synthetic demo dataset representing Oil India Limited operations."
  }
  ```

### `GET /api/dashboard/trends`
Returns monthly volume, IOGP rule distributions, high-risk site ranks, and active alerts.
- **Query Parameters:** `site` (optional)

---

## 3. Reports & Precursors

### `GET /api/reports`
Paginated search and multi-facet filtering across safety observations.
- **Query Parameters:**
  - `q`: Search string
  - `sif`: `true` | `false`
  - `risk_level`: `HIGH` | `MEDIUM` | `LOW`
  - `site`: Facility name
  - `rule`: IOGP Life-Saving Rule
  - `report_type`: `Near-Miss` | `Unsafe Condition` | `Unsafe Act` | `Incident`
  - `page`: int (default 1)
  - `page_size`: int (default 15)
  - `sort_by`: `date` | `risk_score`

### `GET /api/reports/{id}`
Returns complete incident detail, extracted precursor entities, explainable AI reasons, and top similar historical reports.

### `POST /api/reports`
Submits a new safety report, immediately executing the live ML pipeline and persisting to database.
- **Request Body:**
  ```json
  {
    "description": "During pump maintenance at Site A, technician started work before confirming complete electrical isolation.",
    "site": "Site A - Duliajan",
    "report_type": "Near-Miss",
    "department": "Mechanical Maintenance"
  }
  ```

### `PATCH /api/reports/{id}/feedback`
Records Human-in-the-Loop review (Accept / Override SIF classification).
- **Request Body:**
  ```json
  {
    "human_sif_label": false,
    "reviewer_name": "A. K. Sharma (HSE Analyst)",
    "human_comments": "Verified in field that mechanical double-block valves were locked out."
  }
  ```

---

## 4. Live NLP Inference Sandbox

### `POST /api/reports/analyze`
Executes real-time NLP inference without persisting to database.
- **Request Body:**
  ```json
  {
    "description": "Contractor entered production test separator V-101 before completing mandatory 4-gas test.",
    "site": "Site B - Moran"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "sif_potential": true,
    "probability": 0.94,
    "risk_score": 0.94,
    "risk_level": "HIGH",
    "priority": "HIGH",
    "life_saving_rule": "Confined Space",
    "rule_confidence": 0.91,
    "precursors": {
      "activity": "Vessel Entry & Cleaning",
      "location": "Site B - Moran",
      "equipment": "Production Test Separator V-101",
      "hazard": "Toxic H2S Gas & Oxygen Depletion",
      "barrier_failure": "Missing Gas Testing & Standby Watch",
      "potential_consequence": "Asphyxiation and fatal toxic gas inhalation"
    },
    "explanation": [
      "Unauthorized entry into enclosed production vessel containing residual hydrocarbon sludge.",
      "Critical barrier failure: multi-gas testing not performed prior to manway entry.",
      "High probability of instantaneous unconsciousness from H2S gas pocket."
    ]
  }
  ```

---

## 5. Systemic Patterns & Clustering

### `GET /api/patterns`
Returns recurring multi-dimensional failure combinations (Activity + Barrier Failure + Rule + Site).

---

## 6. Alerts & Interventions

### `GET /api/alerts`
Returns active priority alerts.

### `PATCH /api/alerts/{id}`
Acknowledges or resolves an active alert.

### `GET /api/interventions`
Returns all 5-stage corrective action interventions.

### `POST /api/interventions`
Creates a new HSE corrective action plan.

### `PATCH /api/interventions/{id}`
Advances the intervention stage (`Detected` → `Under Review` → `Action Assigned` → `Corrective Action` → `Resolved`).
