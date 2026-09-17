import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(50), default="HSE Analyst")  # HSE Analyst, HSE Manager, Administrator
    department = Column(String(100), default="Corporate HSE")
    organization = Column(String(120), default="Oil India Limited")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    report_type = Column(String(50), index=True, default="Near-Miss")  # Near-Miss, Unsafe Condition, Unsafe Act, Incident
    date = Column(String(50), index=True, nullable=False)
    site = Column(String(100), index=True, nullable=False)
    site_code = Column(String(20), nullable=True)
    department = Column(String(100), index=True, nullable=True)
    submitted_by = Column(String(120), nullable=True)
    priority = Column(String(20), default="LOW")
    status = Column(String(50), default="Detected")  # Detected, Under Review, Action Assigned, Corrective Action, Resolved
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    prediction = relationship("AIPrediction", back_populates="report", uselist=False, cascade="all, delete-orphan")
    precursor = relationship("Precursor", back_populates="report", uselist=False, cascade="all, delete-orphan")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, unique=True)
    sif_potential = Column(Boolean, index=True, nullable=False)
    probability = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), index=True, default="LOW")  # LOW, MEDIUM, HIGH
    priority = Column(String(20), default="LOW")
    confidence = Column(Float, default=0.85)
    model_version = Column(String(50), default="v1.2-sih-hybrid")
    
    # Human-in-the-loop validation
    reviewed_by_human = Column(Boolean, default=False)
    human_override = Column(Boolean, default=False)
    reviewer_name = Column(String(120), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    human_sif_label = Column(Boolean, nullable=True)
    human_comments = Column(Text, nullable=True)

    report = relationship("Report", back_populates="prediction")


class Precursor(Base):
    __tablename__ = "precursors"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, unique=True)
    activity = Column(String(120), index=True, nullable=True)
    location = Column(String(150), nullable=True)
    equipment = Column(String(150), nullable=True)
    hazard = Column(String(150), nullable=True)
    barrier_failure = Column(String(150), index=True, nullable=True)
    unsafe_act = Column(Text, nullable=True)
    unsafe_condition = Column(Text, nullable=True)
    potential_consequence = Column(Text, nullable=True)
    life_saving_rule = Column(String(100), index=True, nullable=True)
    explanation_raw = Column(Text, nullable=True)

    report = relationship("Report", back_populates="precursor")

    @property
    def explanation(self):
        if self.explanation_raw:
            try:
                return json.loads(self.explanation_raw)
            except Exception:
                return [self.explanation_raw]
        return []

    @explanation.setter
    def explanation(self, value):
        if isinstance(value, list):
            self.explanation_raw = json.dumps(value)
        elif isinstance(value, str):
            self.explanation_raw = json.dumps([value])
        else:
            self.explanation_raw = json.dumps([])


class LifeSavingRule(Base):
    __tablename__ = "life_saving_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), unique=True, nullable=False)
    iogp_code = Column(String(20), nullable=True)
    icon = Column(String(50), default="ShieldAlert")
    description = Column(Text, nullable=False)
    severity_weight = Column(Float, default=0.90)
    mandatory_barriers_raw = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)

    @property
    def mandatory_barriers(self):
        if self.mandatory_barriers_raw:
            try:
                return json.loads(self.mandatory_barriers_raw)
            except Exception:
                return [self.mandatory_barriers_raw]
        return []

    @mandatory_barriers.setter
    def mandatory_barriers(self, value):
        if isinstance(value, list):
            self.mandatory_barriers_raw = json.dumps(value)
        else:
            self.mandatory_barriers_raw = json.dumps([])


class Pattern(Base):
    __tablename__ = "patterns"

    id = Column(Integer, primary_key=True, index=True)
    pattern_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    activity = Column(String(120), index=True, nullable=False)
    barrier_failure = Column(String(150), index=True, nullable=False)
    life_saving_rule = Column(String(100), index=True, nullable=False)
    site = Column(String(100), index=True, nullable=False)
    equipment = Column(String(150), nullable=True)
    occurrences = Column(Integer, default=1)
    sif_count = Column(Integer, default=0)
    sif_percentage = Column(Float, default=0.0)
    average_risk_score = Column(Float, default=0.5)
    risk_tier = Column(String(30), default="HIGH RISK")
    risk_level = Column(String(20), default="HIGH")
    trend = Column(String(30), default="Increasing")
    recommended_action = Column(Text, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), index=True, default="CRITICAL")  # CRITICAL, HIGH, MEDIUM, LOW
    alert_type = Column(String(50), default="SIF Potential")
    site = Column(String(100), index=True, nullable=False)
    time = Column(String(50), default="Just now")
    recommended_action = Column(Text, nullable=True)
    acknowledged = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    intervention_id = Column(String(50), unique=True, index=True, nullable=False)
    report_id = Column(String(50), nullable=True)
    pattern_id = Column(String(50), nullable=True)
    title = Column(String(255), nullable=False)
    stage = Column(String(50), index=True, default="Detected")  # Detected, Under Review, Action Assigned, Corrective Action, Resolved
    assigned_to = Column(String(120), default="HSE Team")
    site = Column(String(100), index=True, nullable=False)
    priority = Column(String(20), default="HIGH")
    corrective_action = Column(Text, nullable=False)
    due_date = Column(String(50), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
