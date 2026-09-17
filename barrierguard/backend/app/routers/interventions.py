from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import Intervention
from ..schemas.schemas import InterventionOut, InterventionCreate, InterventionUpdate

router = APIRouter(prefix="/interventions", tags=["HSE Interventions"])

@router.get("", response_model=List[InterventionOut])
def get_interventions(stage: str = None, site: str = None, db: Session = Depends(get_db)):
    query = db.query(Intervention)
    if stage and stage != "All":
        query = query.filter(Intervention.stage == stage)
    if site and site != "All Sites":
        query = query.filter(Intervention.site == site)

    return query.order_by(Intervention.id.desc()).all()

@router.post("", response_model=InterventionOut)
def create_intervention(payload: InterventionCreate, db: Session = Depends(get_db)):
    count = db.query(Intervention).count() + 1
    int_id = f"INT-2025-{count:03d}"

    intervention = Intervention(
        intervention_id=int_id,
        report_id=payload.report_id,
        pattern_id=payload.pattern_id,
        title=payload.title,
        stage="Action Assigned",
        assigned_to=payload.assigned_to,
        site=payload.site,
        priority=payload.priority,
        corrective_action=payload.corrective_action,
        due_date=payload.due_date
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return intervention

@router.patch("/{intervention_id}", response_model=InterventionOut)
def update_intervention(intervention_id: str, payload: InterventionUpdate, db: Session = Depends(get_db)):
    if intervention_id.isdigit():
        item = db.query(Intervention).filter(Intervention.id == int(intervention_id)).first()
    else:
        item = db.query(Intervention).filter(Intervention.intervention_id == intervention_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Intervention not found")

    if payload.stage is not None:
        item.stage = payload.stage
        if payload.stage == "Resolved":
            item.resolved_at = datetime.utcnow()
    if payload.assigned_to is not None:
        item.assigned_to = payload.assigned_to
    if payload.corrective_action is not None:
        item.corrective_action = payload.corrective_action

    db.commit()
    db.refresh(item)
    return item
