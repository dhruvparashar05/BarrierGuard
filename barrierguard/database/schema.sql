-- BarrierGuard: SIF Precursor Intelligence Engine
-- PostgreSQL Schema with pgvector extension for Oil India Limited (OIL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(50) DEFAULT 'HSE Analyst',
    department VARCHAR(100) DEFAULT 'Corporate HSE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Life-Saving Rules table
CREATE TABLE IF NOT EXISTS life_saving_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    iogp_code VARCHAR(20),
    icon VARCHAR(50) DEFAULT 'ShieldAlert',
    description TEXT NOT NULL,
    severity_weight FLOAT DEFAULT 0.90,
    mandatory_barriers_raw TEXT,
    recommended_action TEXT
);

-- 3. Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    report_type VARCHAR(50) DEFAULT 'Near-Miss',
    date VARCHAR(50) NOT NULL,
    site VARCHAR(100) NOT NULL,
    site_code VARCHAR(20),
    department VARCHAR(100),
    submitted_by VARCHAR(120),
    priority VARCHAR(20) DEFAULT 'LOW',
    status VARCHAR(50) DEFAULT 'Detected',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. AI Predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    report_id INTEGER UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    sif_potential BOOLEAN NOT NULL,
    probability FLOAT NOT NULL,
    risk_score FLOAT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    priority VARCHAR(20) DEFAULT 'LOW',
    confidence FLOAT DEFAULT 0.85,
    model_version VARCHAR(50) DEFAULT 'v1.2-sih-hybrid',
    reviewed_by_human BOOLEAN DEFAULT FALSE,
    human_override BOOLEAN DEFAULT FALSE,
    reviewer_name VARCHAR(120),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    human_sif_label BOOLEAN,
    human_comments TEXT
);

-- 5. Precursors table
CREATE TABLE IF NOT EXISTS precursors (
    id SERIAL PRIMARY KEY,
    report_id INTEGER UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    activity VARCHAR(120),
    location VARCHAR(150),
    equipment VARCHAR(150),
    hazard VARCHAR(150),
    barrier_failure VARCHAR(150),
    unsafe_act TEXT,
    unsafe_condition TEXT,
    potential_consequence TEXT,
    life_saving_rule VARCHAR(100),
    explanation_raw TEXT
);

-- 6. Patterns table
CREATE TABLE IF NOT EXISTS patterns (
    id SERIAL PRIMARY KEY,
    pattern_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    activity VARCHAR(120) NOT NULL,
    barrier_failure VARCHAR(150) NOT NULL,
    life_saving_rule VARCHAR(100) NOT NULL,
    site VARCHAR(100) NOT NULL,
    equipment VARCHAR(150),
    occurrences INTEGER DEFAULT 1,
    sif_count INTEGER DEFAULT 0,
    sif_percentage FLOAT DEFAULT 0.0,
    average_risk_score FLOAT DEFAULT 0.5,
    risk_tier VARCHAR(30) DEFAULT 'HIGH RISK',
    risk_level VARCHAR(20) DEFAULT 'HIGH',
    trend VARCHAR(30) DEFAULT 'Increasing',
    recommended_action TEXT
);

-- 7. Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'CRITICAL',
    alert_type VARCHAR(50) DEFAULT 'SIF Potential',
    site VARCHAR(100) NOT NULL,
    time VARCHAR(50) DEFAULT 'Just now',
    recommended_action TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Interventions table
CREATE TABLE IF NOT EXISTS interventions (
    id SERIAL PRIMARY KEY,
    intervention_id VARCHAR(50) UNIQUE NOT NULL,
    report_id VARCHAR(50),
    pattern_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(50) DEFAULT 'Detected',
    assigned_to VARCHAR(120) DEFAULT 'HSE Team',
    site VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'HIGH',
    corrective_action TEXT NOT NULL,
    due_date VARCHAR(50),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid indexing
CREATE INDEX IF NOT EXISTS idx_reports_site ON reports(site);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_sif ON ai_predictions(sif_potential);
CREATE INDEX IF NOT EXISTS idx_precursors_activity ON precursors(activity);
CREATE INDEX IF NOT EXISTS idx_precursors_barrier ON precursors(barrier_failure);
CREATE INDEX IF NOT EXISTS idx_patterns_site ON patterns(site);
