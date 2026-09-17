from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import Pattern, Report, Precursor, AIPrediction
from ..schemas.schemas import PatternOut

router = APIRouter(prefix="/patterns", tags=["Patterns"])

@router.get("", response_model=List[PatternOut])
def get_patterns(risk_level: str = None, site: str = None, db: Session = Depends(get_db)):
    query = db.query(Pattern)
    if risk_level and risk_level != "All":
        query = query.filter(Pattern.risk_level == risk_level)
    if site and site != "All Sites":
        query = query.filter(Pattern.site == site)

    patterns = query.order_by(Pattern.occurrences.desc()).all()

    result = []
    for p in patterns:
        # Fetch up to 3 sample reports matching this pattern's activity and site
        sample_reps = (
            db.query(Report)
            .join(Precursor, Precursor.report_id == Report.id)
            .filter(
                Precursor.activity == p.activity,
                Report.site == p.site
            )
            .limit(3)
            .all()
        )

        samples = [
            {
                "id": r.report_id,
                "title": r.title,
                "date": r.date,
                "risk_score": r.prediction.risk_score if r.prediction else 0.5
            }
            for r in sample_reps
        ]

        result.append({
            "id": p.pattern_id,
            "pattern_id": p.pattern_id,
            "name": p.name,
            "activity": p.activity,
            "barrier_failure": p.barrier_failure,
            "life_saving_rule": p.life_saving_rule,
            "site": p.site,
            "equipment": p.equipment,
            "occurrences": p.occurrences,
            "sif_count": p.sif_count,
            "sif_percentage": p.sif_percentage,
            "average_risk_score": p.average_risk_score,
            "risk_tier": p.risk_tier,
            "risk_level": p.risk_level,
            "trend": p.trend,
            "recommended_action": p.recommended_action,
            "sample_reports": samples
        })

    return result

@router.get("/{pattern_id}", response_model=PatternOut)
def get_pattern_detail(pattern_id: str, db: Session = Depends(get_db)):
    p = db.query(Pattern).filter(Pattern.pattern_id == pattern_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pattern not found")

    sample_reps = (
        db.query(Report)
        .join(Precursor, Precursor.report_id == Report.id)
        .filter(
            Precursor.activity == p.activity,
            Report.site == p.site
        )
        .limit(6)
        .all()
    )

    samples = [
        {
            "id": r.report_id,
            "title": r.title,
            "date": r.date,
            "risk_score": r.prediction.risk_score if r.prediction else 0.5
        }
        for r in sample_reps
    ]

    return {
        "id": p.pattern_id,
        "pattern_id": p.pattern_id,
        "name": p.name,
        "activity": p.activity,
        "barrier_failure": p.barrier_failure,
        "life_saving_rule": p.life_saving_rule,
        "site": p.site,
        "equipment": p.equipment,
        "occurrences": p.occurrences,
        "sif_count": p.sif_count,
        "sif_percentage": p.sif_percentage,
        "average_risk_score": p.average_risk_score,
        "risk_tier": p.risk_tier,
        "risk_level": p.risk_level,
        "trend": p.trend,
        "recommended_action": p.recommended_action,
        "sample_reports": samples
    }
