from collections import defaultdict
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import Report, AIPrediction, Precursor

router = APIRouter(prefix="/analytics/sites", tags=["Site Analytics"])

@router.get("", response_model=Dict[str, Any])
def get_site_analytics(db: Session = Depends(get_db)):
    reports = db.query(Report, AIPrediction, Precursor).join(AIPrediction).outerjoin(Precursor).all()

    site_map = defaultdict(lambda: {
        "total": 0,
        "sif": 0,
        "risk_scores": [],
        "activities": defaultdict(int),
        "rules": defaultdict(int),
        "failures": defaultdict(int)
    })

    for rep, pred, prec in reports:
        site_name = rep.site
        site_map[site_name]["total"] += 1
        if pred and pred.sif_potential:
            site_map[site_name]["sif"] += 1
        if pred:
            site_map[site_name]["risk_scores"].append(pred.risk_score)
        if prec and prec.activity:
            site_map[site_name]["activities"][prec.activity] += 1
        if prec and prec.life_saving_rule:
            site_map[site_name]["rules"][prec.life_saving_rule] += 1
        if prec and prec.barrier_failure:
            site_map[site_name]["failures"][prec.barrier_failure] += 1

    site_summaries = []
    high_count = 0
    med_count = 0
    low_count = 0

    for site_name, data in site_map.items():
        total = data["total"]
        sif = data["sif"]
        density = round((sif / total * 100), 1) if total > 0 else 0.0
        avg_risk = round(sum(data["risk_scores"]) / len(data["risk_scores"]), 2) if data["risk_scores"] else 0.2

        if density >= 24.0 or avg_risk >= 0.55:
            risk_tier = "HIGH"
            high_count += 1
        elif density >= 14.0 or avg_risk >= 0.35:
            risk_tier = "MEDIUM"
            med_count += 1
        else:
            risk_tier = "LOW"
            low_count += 1

        top_act = max(data["activities"].items(), key=lambda x: x[1])[0] if data["activities"] else "General"
        top_rule = max(data["rules"].items(), key=lambda x: x[1])[0] if data["rules"] else "Work Authorization"
        top_fail = max(data["failures"].items(), key=lambda x: x[1])[0] if data["failures"] else "Standard Failure"

        site_summaries.append({
            "site": site_name,
            "total_reports": total,
            "sif_reports": sif,
            "sif_density_pct": density,
            "average_risk_score": avg_risk,
            "risk_tier": risk_tier,
            "top_activity": top_act,
            "top_rule": top_rule,
            "top_barrier_failure": top_fail
        })

    # Sort descending by SIF count
    site_summaries.sort(key=lambda x: x["sif_reports"], reverse=True)

    return {
        "kpi": {
            "total_sites": len(site_summaries),
            "high_risk_sites": high_count,
            "medium_risk_sites": med_count,
            "low_risk_sites": low_count
        },
        "sites": site_summaries
    }
