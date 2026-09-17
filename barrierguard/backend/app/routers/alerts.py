from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import Alert
from ..schemas.schemas import AlertOut, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(site: str = None, severity: str = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if site and site != "All Sites":
        query = query.filter(Alert.site == site)
    if severity and severity != "All":
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(Alert.acknowledged.asc(), Alert.id.asc()).all()
    return alerts

@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert_status(alert_id: str, payload: AlertUpdate, db: Session = Depends(get_db)):
    if alert_id.isdigit():
        alert = db.query(Alert).filter(Alert.id == int(alert_id)).first()
    else:
        alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if payload.acknowledged is not None:
        alert.acknowledged = payload.acknowledged
    if payload.resolved is not None:
        alert.resolved = payload.resolved

    db.commit()
    db.refresh(alert)
    return alert
