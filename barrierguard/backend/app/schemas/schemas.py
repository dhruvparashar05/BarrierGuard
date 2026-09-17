from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    full_name: str
    email: str
    organization: Optional[str] = "Oil India Limited"
    role: Optional[str] = "HSE Analyst"
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    organization: Optional[str] = "Oil India Limited"
    is_active: Optional[bool] = True

class PrecursorSchema(BaseModel):
    activity: Optional[str] = None
    location: Optional[str] = None
    equipment: Optional[str] = None
    hazard: Optional[str] = None
    barrier_failure: Optional[str] = None
    unsafe_act: Optional[str] = None
    unsafe_condition: Optional[str] = None
    potential_consequence: Optional[str] = None
    life_saving_rule: Optional[str] = None
    explanation: Optional[List[str]] = []

class AIPredictionSchema(BaseModel):
    sif_potential: bool
    probability: float
    risk_score: float
    risk_level: str
    priority: str
    confidence: float
    model_version: str
    reviewed_by_human: bool = False
    human_override: bool = False
    reviewer_name: Optional[str] = None
    human_sif_label: Optional[bool] = None
    human_comments: Optional[str] = None

class AIFeedbackUpdate(BaseModel):
    human_sif_label: bool
    reviewer_name: str = "HSE Analyst"
    human_comments: Optional[str] = None

class ReportCreate(BaseModel):
    title: Optional[str] = None
    description: str
    report_type: str = "Near-Miss"
    site: str
    department: Optional[str] = "Production Operations"
    submitted_by: Optional[str] = "HSE Field Specialist"

class ReportOut(BaseModel):
    id: int
    report_id: str
    title: str
    description: str
    report_type: str
    date: str
    site: str
    department: Optional[str]
    submitted_by: Optional[str]
    priority: str
    status: str
    sif_potential: bool
    risk_score: float
    risk_level: str
    life_saving_rule: Optional[str]
    barrier_failure: Optional[str]

class ReportDetail(ReportOut):
    precursors: Optional[PrecursorSchema]
    prediction: Optional[AIPredictionSchema]
    similar_reports: Optional[List[Dict[str, Any]]] = []

class AnalyzeRequest(BaseModel):
    description: str
    report_type: Optional[str] = "Near-Miss"
    site: Optional[str] = "Site A - Duliajan"
    department: Optional[str] = "Production Operations"

class AnalyzeResponse(BaseModel):
    sif_potential: bool
    probability: float
    risk_score: float
    risk_level: str
    priority: str
    confidence: float
    life_saving_rule: str
    rule_confidence: float
    precursors: PrecursorSchema
    explanation: List[str]
    mandatory_barriers: List[str]
    recommended_action: str
    similar_historical_reports: List[Dict[str, Any]]

class PatternOut(BaseModel):
    id: str
    pattern_id: str
    name: str
    activity: str
    barrier_failure: str
    life_saving_rule: str
    site: str
    equipment: Optional[str]
    occurrences: int
    sif_count: int
    sif_percentage: float
    average_risk_score: float
    risk_tier: str
    risk_level: str
    trend: str
    recommended_action: Optional[str]
    sample_reports: Optional[List[Dict[str, Any]]] = []

class AlertOut(BaseModel):
    id: int
    alert_id: str
    title: str
    description: str
    severity: str
    alert_type: str
    site: str
    time: str
    recommended_action: Optional[str]
    acknowledged: bool
    resolved: bool

class AlertUpdate(BaseModel):
    acknowledged: Optional[bool] = None
    resolved: Optional[bool] = None

class InterventionCreate(BaseModel):
    report_id: Optional[str] = None
    pattern_id: Optional[str] = None
    title: str
    site: str
    priority: str = "HIGH"
    corrective_action: str
    assigned_to: str = "Field HSE Lead"
    due_date: Optional[str] = None

class InterventionOut(BaseModel):
    id: int
    intervention_id: str
    report_id: Optional[str]
    pattern_id: Optional[str]
    title: str
    stage: str
    assigned_to: str
    site: str
    priority: str
    corrective_action: str
    due_date: Optional[str]
    created_at: Optional[Any]

class InterventionUpdate(BaseModel):
    stage: Optional[str] = None
    assigned_to: Optional[str] = None
    corrective_action: Optional[str] = None

class DashboardSummaryOut(BaseModel):
    total_reports: int
    sif_potential_reports: int
    sif_percentage: float
    high_risk_patterns: int
    priority_sites_count: int
    recent_alerts_count: int
    sif_trend_direction: str
    disclaimer: str = "BarrierGuard Prototype: Using synthetic demo dataset representing Oil India Limited operations."

class DashboardTrendsOut(BaseModel):
    monthly_trend: List[Dict[str, Any]]
    rules_distribution: List[Dict[str, Any]]
    top_high_risk_sites: List[Dict[str, Any]]
    recent_alerts: List[Dict[str, Any]]
