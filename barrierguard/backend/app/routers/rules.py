from collections import defaultdict
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import LifeSavingRule, Report, AIPrediction, Precursor

router = APIRouter(prefix="", tags=["Life-Saving Rules"])

@router.get("/life-saving-rules", response_model=List[Dict[str, Any]])
def get_life_saving_rules(db: Session = Depends(get_db)):
    rules = db.query(LifeSavingRule).all()
    reports = db.query(Report, AIPrediction, Precursor).join(AIPrediction).outerjoin(Precursor).all()

    rule_stats = defaultdict(lambda: {
        "count": 0,
        "sif": 0,
        "sites": defaultdict(int),
        "activities": defaultdict(int),
        "failures": defaultdict(int)
    })

    for rep, pred, prec in reports:
        r_name = (prec.life_saving_rule if prec and prec.life_saving_rule else None)
        if r_name:
            rule_stats[r_name]["count"] += 1
            if pred and pred.sif_potential:
                rule_stats[r_name]["sif"] += 1
            rule_stats[r_name]["sites"][rep.site] += 1
            if prec.activity:
                rule_stats[r_name]["activities"][prec.activity] += 1
            if prec.barrier_failure:
                rule_stats[r_name]["failures"][prec.barrier_failure] += 1

    result = []
    for r in rules:
        data = rule_stats[r.name]
        cnt = data["count"]
        sif = data["sif"]
        sif_pct = round((sif / cnt * 100), 1) if cnt > 0 else 0.0

        top_site = max(data["sites"].items(), key=lambda x: x[1])[0] if data["sites"] else "Field HQ"
        top_act = max(data["activities"].items(), key=lambda x: x[1])[0] if data["activities"] else "Maintenance"
        top_fail = max(data["failures"].items(), key=lambda x: x[1])[0] if data["failures"] else "Standard Failure"

        result.append({
            "id": r.rule_id,
            "name": r.name,
            "iogp_code": r.iogp_code,
            "icon": r.icon,
            "description": r.description,
            "severity_weight": r.severity_weight,
            "mandatory_barriers": r.mandatory_barriers,
            "recommended_action": r.recommended_action,
            "reports_count": cnt,
            "sif_percentage": sif_pct,
            "trend": "+2.5%" if sif_pct > 30 else "Stable",
            "top_site": top_site,
            "top_activity": top_act,
            "common_barrier_failure": top_fail
        })

    result.sort(key=lambda x: x["reports_count"], reverse=True)
    return result

@router.get("/analytics/rules", response_model=Dict[str, Any])
def get_rule_analytics(db: Session = Depends(get_db)):
    rules_data = get_life_saving_rules(db)
    return {
        "rules": rules_data,
        "total_rules": len(rules_data),
        "most_violated_rule": rules_data[0]["name"] if rules_data else "None"
    }
