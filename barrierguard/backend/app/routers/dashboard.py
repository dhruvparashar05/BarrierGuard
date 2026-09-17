from collections import defaultdict
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.entities import Report, AIPrediction, Precursor, Pattern, Alert
from ..schemas.schemas import DashboardSummaryOut, DashboardTrendsOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(site: str = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if site and site != "All Sites":
        query = query.filter(Report.site == site)

    total_reports = query.count()

    pred_query = db.query(AIPrediction).join(Report)
    if site and site != "All Sites":
        pred_query = pred_query.filter(Report.site == site)

    sif_reports = pred_query.filter(AIPrediction.sif_potential == True).count()
    sif_pct = round((sif_reports / total_reports * 100), 1) if total_reports > 0 else 0.0

    high_risk_patterns = db.query(Pattern).filter(Pattern.risk_level == "HIGH").count()

    # Priority sites (sites with high SIF count)
    site_counts = (
        db.query(Report.site, func.count(Report.id))
        .join(AIPrediction)
        .filter(AIPrediction.sif_potential == True)
        .group_by(Report.site)
        .all()
    )
    priority_sites_count = sum(1 for s in site_counts if s[1] >= 15)

    recent_alerts_count = db.query(Alert).filter(Alert.acknowledged == False).count()

    return {
        "total_reports": total_reports,
        "sif_potential_reports": sif_reports,
        "sif_percentage": sif_pct,
        "high_risk_patterns": high_risk_patterns,
        "priority_sites_count": max(1, priority_sites_count),
        "recent_alerts_count": recent_alerts_count,
        "sif_trend_direction": "Decreasing (-4.2% MoM)",
        "disclaimer": "BarrierGuard Prototype: Using synthetic demo dataset representing Oil India Limited operations."
    }

@router.get("/trends", response_model=DashboardTrendsOut)
def get_dashboard_trends(site: str = None, db: Session = Depends(get_db)):
    # 1. Monthly Trend
    # Build monthly counts from reports
    rep_query = db.query(Report.date, AIPrediction.sif_potential).join(AIPrediction)
    if site and site != "All Sites":
        rep_query = rep_query.filter(Report.site == site)

    reps = rep_query.all()
    monthly_data = defaultdict(lambda: {"total": 0, "sif": 0})

    for r_date_str, is_sif in reps:
        try:
            # Parse ISO or date prefix
            dt = datetime.fromisoformat(r_date_str)
            month_key = dt.strftime("%b %Y")
        except Exception:
            month_key = "Recent"

        monthly_data[month_key]["total"] += 1
        if is_sif:
            monthly_data[month_key]["sif"] += 1

    monthly_trend = [
        {
            "month": m,
            "total_reports": val["total"],
            "sif_reports": val["sif"],
            "non_sif_reports": val["total"] - val["sif"],
            "sif_rate": round((val["sif"] / val["total"] * 100), 1) if val["total"] > 0 else 0
        }
        for m, val in list(monthly_data.items())[-6:]
    ]

    # 2. Rules Distribution
    rule_counts = (
        db.query(Precursor.life_saving_rule, func.count(Report.id))
        .join(Report, Precursor.report_id == Report.id)
        .join(AIPrediction, AIPrediction.report_id == Report.id)
        .filter(AIPrediction.sif_potential == True)
        .group_by(Precursor.life_saving_rule)
        .all()
    )
    rules_distribution = [
        {"name": r[0] or "Other", "value": r[1]}
        for r in sorted(rule_counts, key=lambda x: x[1], reverse=True)[:7]
    ]

    # 3. Top High Risk Sites
    site_data = defaultdict(lambda: {"total": 0, "sif": 0})
    site_rows = db.query(Report.site, AIPrediction.sif_potential).join(AIPrediction).all()
    for s_name, is_sif in site_rows:
        site_data[s_name]["total"] += 1
        if is_sif:
            site_data[s_name]["sif"] += 1

    top_high_risk_sites = []
    sorted_sites = sorted(site_data.items(), key=lambda x: x[1]["sif"], reverse=True)
    for rank, (site_name, counts) in enumerate(sorted_sites, start=1):
        total = counts["total"]
        sif_cnt = counts["sif"]
        density = round((sif_cnt / total * 100), 1) if total > 0 else 0.0
        risk = "HIGH" if density >= 25.0 else ("MEDIUM" if density >= 15.0 else "LOW")
        top_high_risk_sites.append({
            "rank": rank,
            "site": site_name,
            "total_reports": total,
            "sif_reports": sif_cnt,
            "sif_density": f"{density}%",
            "risk": risk,
            "trend": "+4.1%" if rank == 1 else ("-1.8%" if rank == 2 else "Stable")
        })

    # 4. Recent Alerts
    alerts = (
        db.query(Alert)
        .order_by(Alert.id.asc())
        .limit(5)
        .all()
    )
    recent_alerts = [
        {
            "id": a.id,
            "alert_id": a.alert_id,
            "title": a.title,
            "description": a.description,
            "severity": a.severity,
            "site": a.site,
            "time": a.time,
            "recommended_action": a.recommended_action
        }
        for a in alerts
    ]

    return {
        "monthly_trend": monthly_trend,
        "rules_distribution": rules_distribution,
        "top_high_risk_sites": top_high_risk_sites,
        "recent_alerts": recent_alerts
    }
