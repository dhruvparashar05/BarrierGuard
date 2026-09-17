from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from ..database import get_db
from ..models.entities import Report, AIPrediction, Precursor, LifeSavingRule
from ..schemas.schemas import ReportOut, ReportDetail, ReportCreate, AIFeedbackUpdate
from barrierguard.ml.classifier.predictor import predictor
from barrierguard.ml.rule_mapping.matcher import rule_matcher
from barrierguard.ml.extraction.extractor import precursor_extractor
from barrierguard.ml.explainability.explainer import explainer
from barrierguard.ml.embeddings.similarity import similarity_engine

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=Dict[str, Any])
def get_reports(
    q: Optional[str] = None,
    sif: Optional[bool] = None,
    risk_level: Optional[str] = None,
    site: Optional[str] = None,
    rule: Optional[str] = None,
    report_type: Optional[str] = None,
    priority: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    sort_by: str = "date",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    query = (
        db.query(Report, AIPrediction, Precursor)
        .join(AIPrediction, AIPrediction.report_id == Report.id)
        .outerjoin(Precursor, Precursor.report_id == Report.id)
    )

    # Text Search Filter
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Report.title.ilike(search_pattern),
                Report.description.ilike(search_pattern),
                Report.report_id.ilike(search_pattern),
                Report.site.ilike(search_pattern),
                Precursor.life_saving_rule.ilike(search_pattern),
                Precursor.activity.ilike(search_pattern),
                Precursor.barrier_failure.ilike(search_pattern)
            )
        )

    # Categorical Filters
    if sif is not None:
        query = query.filter(AIPrediction.sif_potential == sif)
    if risk_level and risk_level != "All":
        query = query.filter(AIPrediction.risk_level == risk_level)
    if site and site != "All Sites":
        query = query.filter(Report.site == site)
    if rule and rule != "All Rules":
        query = query.filter(Precursor.life_saving_rule == rule)
    if report_type and report_type != "All Types":
        query = query.filter(Report.report_type == report_type)
    if priority and priority != "All":
        query = query.filter(Report.priority == priority)

    total_count = query.count()

    # Sorting
    if sort_by == "risk_score":
        sort_col = AIPrediction.risk_score
    elif sort_by == "report_id":
        sort_col = Report.report_id
    else:
        sort_col = Report.date

    if order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    # Pagination
    offset = (page - 1) * page_size
    records = query.offset(offset).limit(page_size).all()

    items = []
    for rep, pred, prec in records:
        items.append({
            "id": rep.id,
            "report_id": rep.report_id,
            "title": rep.title,
            "description": rep.description,
            "report_type": rep.report_type,
            "date": rep.date,
            "site": rep.site,
            "department": rep.department,
            "submitted_by": rep.submitted_by,
            "priority": pred.priority if pred else rep.priority,
            "status": rep.status,
            "sif_potential": pred.sif_potential if pred else False,
            "risk_score": pred.risk_score if pred else 0.2,
            "risk_level": pred.risk_level if pred else "LOW",
            "life_saving_rule": prec.life_saving_rule if prec else "Work Authorization",
            "barrier_failure": prec.barrier_failure if prec else ""
        })

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size
    }

@router.get("/{report_id}", response_model=ReportDetail)
def get_report_detail(report_id: str, db: Session = Depends(get_db)):
    # Match by numeric id or string report_id
    if report_id.isdigit():
        rep = db.query(Report).filter(Report.id == int(report_id)).first()
    else:
        rep = db.query(Report).filter(Report.report_id == report_id).first()

    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")

    pred = rep.prediction
    prec = rep.precursor

    # Similar reports
    similar = similarity_engine.find_similar(
        f"{rep.title} {rep.description}",
        current_id=rep.report_id,
        top_k=5
    )

    return {
        "id": rep.id,
        "report_id": rep.report_id,
        "title": rep.title,
        "description": rep.description,
        "report_type": rep.report_type,
        "date": rep.date,
        "site": rep.site,
        "department": rep.department,
        "submitted_by": rep.submitted_by,
        "priority": pred.priority if pred else rep.priority,
        "status": rep.status,
        "sif_potential": pred.sif_potential if pred else False,
        "risk_score": pred.risk_score if pred else 0.2,
        "risk_level": pred.risk_level if pred else "LOW",
        "life_saving_rule": prec.life_saving_rule if prec else "Work Authorization",
        "barrier_failure": prec.barrier_failure if prec else "",
        "precursors": {
            "activity": prec.activity if prec else None,
            "location": prec.location if prec else None,
            "equipment": prec.equipment if prec else None,
            "hazard": prec.hazard if prec else None,
            "barrier_failure": prec.barrier_failure if prec else None,
            "unsafe_act": prec.unsafe_act if prec else None,
            "unsafe_condition": prec.unsafe_condition if prec else None,
            "potential_consequence": prec.potential_consequence if prec else None,
            "life_saving_rule": prec.life_saving_rule if prec else None,
            "explanation": prec.explanation if prec else []
        } if prec else None,
        "prediction": {
            "sif_potential": pred.sif_potential if pred else False,
            "probability": pred.probability if pred else 0.1,
            "risk_score": pred.risk_score if pred else 0.2,
            "risk_level": pred.risk_level if pred else "LOW",
            "priority": pred.priority if pred else "LOW",
            "confidence": pred.confidence if pred else 0.85,
            "model_version": pred.model_version if pred else "v1.2-sih-hybrid",
            "reviewed_by_human": pred.reviewed_by_human if pred else False,
            "human_override": pred.human_override if pred else False,
            "reviewer_name": pred.reviewer_name if pred else None,
            "human_sif_label": pred.human_sif_label if pred else None,
            "human_comments": pred.human_comments if pred else None
        } if pred else None,
        "similar_reports": similar
    }

@router.post("", response_model=ReportDetail)
def create_report(payload: ReportCreate, db: Session = Depends(get_db)):
    # 1. Run live ML inference pipeline
    pred_res = predictor.predict(payload.description)
    prec_res = precursor_extractor.extract(payload.description)
    exp_res = explainer.explain(payload.description, prec_res, pred_res["sif_potential"], pred_res["probability"])

    # 2. Determine title if not provided
    title = payload.title
    if not title:
        act = prec_res.get("activity") or "Safety Observation"
        barrier = prec_res.get("barrier_failure") or "Barrier Notice"
        title = f"{act}: {barrier}"

    # 3. Create Report in DB
    now = datetime.now()
    count = db.query(Report).count() + 1
    report_id_str = f"OIL-REP-{now.year}-{count:04d}"

    rep = Report(
        report_id=report_id_str,
        title=title,
        description=payload.description,
        report_type=payload.report_type,
        date=now.isoformat(),
        site=payload.site,
        department=payload.department or "Operations HSE",
        submitted_by=payload.submitted_by or "Field Operator",
        priority=pred_res["priority"],
        status="Under Review" if pred_res["sif_potential"] else "Detected"
    )
    db.add(rep)
    db.flush()

    # 4. Save AI Prediction
    pred = AIPrediction(
        report_id=rep.id,
        sif_potential=pred_res["sif_potential"],
        probability=pred_res["probability"],
        risk_score=pred_res["risk_score"],
        risk_level=pred_res["risk_level"],
        priority=pred_res["priority"],
        confidence=pred_res["model_confidence"],
        model_version=pred_res["model_version"]
    )
    db.add(pred)

    # 5. Save Precursor & Explanation
    prec = Precursor(
        report_id=rep.id,
        activity=prec_res.get("activity"),
        location=prec_res.get("location"),
        equipment=prec_res.get("equipment"),
        hazard=prec_res.get("hazard"),
        barrier_failure=prec_res.get("barrier_failure"),
        unsafe_act=prec_res.get("unsafe_act"),
        unsafe_condition=prec_res.get("unsafe_condition"),
        potential_consequence=prec_res.get("potential_consequence"),
        life_saving_rule=prec_res.get("life_saving_rule")
    )
    prec.explanation = exp_res
    db.add(prec)

    db.commit()

    # Find similar historical reports
    similar = similarity_engine.find_similar(
        f"{rep.title} {rep.description}",
        current_id=rep.report_id,
        top_k=4
    )

    return {
        "id": rep.id,
        "report_id": rep.report_id,
        "title": rep.title,
        "description": rep.description,
        "report_type": rep.report_type,
        "date": rep.date,
        "site": rep.site,
        "department": rep.department,
        "submitted_by": rep.submitted_by,
        "priority": rep.priority,
        "status": rep.status,
        "sif_potential": pred.sif_potential,
        "risk_score": pred.risk_score,
        "risk_level": pred.risk_level,
        "life_saving_rule": prec.life_saving_rule,
        "barrier_failure": prec.barrier_failure,
        "precursors": {
            "activity": prec.activity,
            "location": prec.location,
            "equipment": prec.equipment,
            "hazard": prec.hazard,
            "barrier_failure": prec.barrier_failure,
            "unsafe_act": prec.unsafe_act,
            "unsafe_condition": prec.unsafe_condition,
            "potential_consequence": prec.potential_consequence,
            "life_saving_rule": prec.life_saving_rule,
            "explanation": exp_res
        },
        "prediction": {
            "sif_potential": pred.sif_potential,
            "probability": pred.probability,
            "risk_score": pred.risk_score,
            "risk_level": pred.risk_level,
            "priority": pred.priority,
            "confidence": pred.confidence,
            "model_version": pred.model_version
        },
        "similar_reports": similar
    }

@router.get("/{report_id}/similar", response_model=List[Dict[str, Any]])
def get_similar_reports(report_id: str, db: Session = Depends(get_db)):
    if report_id.isdigit():
        rep = db.query(Report).filter(Report.id == int(report_id)).first()
    else:
        rep = db.query(Report).filter(Report.report_id == report_id).first()

    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")

    return similarity_engine.find_similar(
        f"{rep.title} {rep.description}",
        current_id=rep.report_id,
        top_k=5
    )

@router.patch("/{report_id}/feedback")
def update_human_feedback(report_id: str, feedback: AIFeedbackUpdate, db: Session = Depends(get_db)):
    """Human-in-the-loop validation endpoint allowing HSE Officer to accept or override the AI SIF prediction."""
    if report_id.isdigit():
        rep = db.query(Report).filter(Report.id == int(report_id)).first()
    else:
        rep = db.query(Report).filter(Report.report_id == report_id).first()

    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")

    pred = rep.prediction
    if not pred:
        raise HTTPException(status_code=404, detail="AI prediction not found for report")

    original_label = pred.sif_potential
    is_override = (original_label != feedback.human_sif_label)

    pred.reviewed_by_human = True
    pred.human_override = is_override
    pred.human_sif_label = feedback.human_sif_label
    pred.reviewer_name = feedback.reviewer_name
    pred.human_comments = feedback.human_comments
    pred.reviewed_at = datetime.utcnow()

    # If overridden, adjust effective status
    if is_override:
        pred.sif_potential = feedback.human_sif_label
        pred.risk_level = "HIGH" if feedback.human_sif_label else "LOW"
        pred.risk_score = 0.85 if feedback.human_sif_label else 0.25

    db.commit()

    return {
        "message": "Human review feedback recorded successfully",
        "report_id": rep.report_id,
        "human_override": is_override,
        "effective_sif_potential": pred.sif_potential,
        "reviewer": pred.reviewer_name,
        "reviewed_at": pred.reviewed_at.isoformat()
    }
