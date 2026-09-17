import json
from pathlib import Path
from sqlalchemy.orm import Session
from ..models.entities import User, Report, AIPrediction, Precursor, LifeSavingRule, Pattern, Alert, Intervention
from .auth_service import get_password_hash
from barrierguard.ml.patterns.detector import pattern_detector
from barrierguard.ml.embeddings.similarity import similarity_engine

def seed_database_if_empty(db: Session):
    # Check if reports already exist
    existing_reports_count = db.query(Report).count()
    if existing_reports_count > 0:
        print(f"[Database] Existing database has {existing_reports_count} reports. Indexing similarity engine...")
        # Fit similarity engine with existing reports
        all_reps = db.query(Report).all()
        corpus = []
        for r in all_reps:
            pred = r.prediction
            prec = r.precursor
            corpus.append({
                "id": r.report_id,
                "report_id": r.report_id,
                "title": r.title,
                "description": r.description,
                "site": r.site,
                "date": r.date,
                "sif_potential": pred.sif_potential if pred else False,
                "risk_score": pred.risk_score if pred else 0.2,
                "risk_level": pred.risk_level if pred else "LOW",
                "life_saving_rule": prec.life_saving_rule if prec else "Work Authorization",
                "precursors": {
                    "barrier_failure": prec.barrier_failure if prec else ""
                }
            })
        similarity_engine.fit_corpus(corpus)
        return

    print("[Database] Empty database detected. Seeding initial data...")

    # 1. Seed Users
    demo_users = [
        User(
            email="analyst@barrierguard.demo",
            hashed_password=get_password_hash("Demo@123456"),
            full_name="A. K. Sharma",
            role="HSE Analyst",
            department="Corporate HSE Intelligence",
            organization="Oil India Limited"
        ),
        User(
            email="manager@barrierguard.demo",
            hashed_password=get_password_hash("Demo@123456"),
            full_name="Dr. P. Borah",
            role="HSE Manager",
            department="Field Operations HSE",
            organization="Oil India Limited"
        ),
        User(
            email="admin@barrierguard.demo",
            hashed_password=get_password_hash("Demo@123456"),
            full_name="System Administrator",
            role="Admin",
            department="OIL HSE IT Services",
            organization="Oil India Limited"
        ),
        User(
            email="demo@barrierguard.local",
            hashed_password=get_password_hash("Demo@123456"),
            full_name="A. K. Sharma",
            role="HSE Analyst",
            department="Corporate HSE Intelligence",
            organization="Oil India Limited"
        )
    ]
    for u in demo_users:
        db.add(u)
    db.commit()

    # 2. Seed IOGP Life-Saving Rules
    rules_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "iogp_rules.json"
    if rules_path.exists():
        with open(rules_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for r in data.get("rules", []):
                rule_obj = LifeSavingRule(
                    rule_id=r["id"],
                    name=r["name"],
                    iogp_code=r.get("iogp_code"),
                    icon=r.get("icon", "ShieldAlert"),
                    description=r["description"],
                    severity_weight=r.get("severity_weight", 0.90),
                    recommended_action=r.get("recommended_action", "")
                )
                rule_obj.mandatory_barriers = r.get("mandatory_barriers", [])
                db.add(rule_obj)
        db.commit()

    # 3. Seed Synthetic Reports
    dataset_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "synthetic_reports.json"
    if not dataset_path.exists():
        print(f"[Warning] synthetic_reports.json not found at {dataset_path}")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        synthetic_reports = json.load(f)

    print(f"[Database] Seeding {len(synthetic_reports)} reports...")

    corpus = []
    for r in synthetic_reports:
        rep = Report(
            report_id=r["id"],
            title=r["title"],
            description=r["description"],
            report_type=r["report_type"],
            date=r["date"],
            site=r["site"],
            site_code=r.get("site_code"),
            department=r.get("department"),
            submitted_by=r.get("submitted_by"),
            priority=r.get("priority", "LOW"),
            status=r.get("status", "Detected")
        )
        db.add(rep)
        db.flush()  # to get rep.id

        pred = AIPrediction(
            report_id=rep.id,
            sif_potential=r["sif_potential"],
            probability=r.get("probability", 0.1),
            risk_score=r.get("risk_score", 0.2),
            risk_level=r.get("risk_level", "LOW"),
            priority=r.get("priority", "LOW"),
            confidence=0.92 if r["sif_potential"] else 0.88,
            model_version="v1.2-sih-hybrid",
            reviewed_by_human=r.get("reviewed_by_human", False),
            human_override=r.get("human_override", False)
        )
        db.add(pred)

        precs = r.get("precursors", {})
        prec = Precursor(
            report_id=rep.id,
            activity=precs.get("activity"),
            location=precs.get("location"),
            equipment=precs.get("equipment"),
            hazard=precs.get("hazard"),
            barrier_failure=precs.get("barrier_failure"),
            unsafe_act=precs.get("unsafe_act"),
            unsafe_condition=precs.get("unsafe_condition"),
            potential_consequence=precs.get("potential_consequence"),
            life_saving_rule=r.get("life_saving_rule")
        )
        prec.explanation = r.get("explanation", [])
        db.add(prec)

        corpus.append({
            "id": r["id"],
            "report_id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "site": r["site"],
            "date": r["date"],
            "sif_potential": r["sif_potential"],
            "risk_score": r.get("risk_score", 0.2),
            "risk_level": r.get("risk_level", "LOW"),
            "life_saving_rule": r.get("life_saving_rule", ""),
            "precursors": precs
        })

    db.commit()
    print("[Database] Reports, predictions, and precursors committed.")

    # 4. Index Similarity Engine
    similarity_engine.fit_corpus(corpus)
    print("[Database] Similarity engine indexed successfully.")

    # 5. Detect and Seed Patterns
    patterns = pattern_detector.detect_patterns(synthetic_reports)
    for p in patterns:
        pat = Pattern(
            pattern_id=p["id"],
            name=p["name"],
            activity=p["activity"],
            barrier_failure=p["barrier_failure"],
            life_saving_rule=p["life_saving_rule"],
            site=p["site"],
            equipment=p.get("equipment"),
            occurrences=p["occurrences"],
            sif_count=p["sif_reports_count"],
            sif_percentage=p["sif_percentage"],
            average_risk_score=p["average_risk_score"],
            risk_tier=p["risk_tier"],
            risk_level=p["risk_level"],
            trend=p["trend"],
            recommended_action=p["recommended_action"]
        )
        db.add(pat)
    db.commit()
    print(f"[Database] {len(patterns)} patterns seeded.")

    # 6. Seed Alerts based on High-Risk Patterns
    demo_alerts = [
        Alert(
            alert_id="ALT-2025-001",
            title="Pump maintenance — isolation not verified spike",
            description="Recurring Energy Isolation precursor frequency escalated at Site A - Duliajan. 12 reports in the past 14 days.",
            severity="CRITICAL",
            alert_type="Recurring Precursor",
            site="Site A - Duliajan",
            time="12 mins ago",
            recommended_action="Issue mandatory electrical LOTO audit and halt unverified pump switchgear overhauls.",
            acknowledged=False,
            resolved=False
        ),
        Alert(
            alert_id="ALT-2025-002",
            title="Vessel entry — missing gas test non-compliance",
            description="3 near-miss reports detected of contractor entry into separator vessels without certified 4-gas test.",
            severity="CRITICAL",
            alert_type="Life-Saving Rule Violation",
            site="Site B - Moran",
            time="45 mins ago",
            recommended_action="Evacuate vessels, calibrate multi-gas meters, and verify physical hole-watcher presence.",
            acknowledged=False,
            resolved=False
        ),
        Alert(
            alert_id="ALT-2025-003",
            title="Hot work — inadequate permit & combustible vapor vicinity",
            description="Sparks observed within 10 meters of active crude header drain line at GGS-2.",
            severity="HIGH",
            alert_type="SIF Precursor",
            site="Site E - Naharkatiya",
            time="2 hours ago",
            recommended_action="Enforce Class-A hot work permit verification and deploy fire retardant habitats.",
            acknowledged=True,
            resolved=False
        ),
        Alert(
            alert_id="ALT-2025-004",
            title="Derrick mast work — 100% tie-off compliance dropped",
            description="Derrickman observed unclipping twin-tail lanyard while transitioning across pipe racking fingers at 24m.",
            severity="CRITICAL",
            alert_type="Life-Saving Rule Violation",
            site="Site D - Jorhat",
            time="4 hours ago",
            recommended_action="Conduct mandatory toolbox stand-down on fall arrest harness inspection and intermediate anchor points.",
            acknowledged=True,
            resolved=False
        ),
        Alert(
            alert_id="ALT-2025-005",
            title="Crude bowser fleet overspeed alerts on oilfield road",
            description="IVMS logged 5 over-speed events (>65 km/h) on single-lane corridor road #4.",
            severity="HIGH",
            alert_type="High-Risk Behavior",
            site="Site B - Moran",
            time="1 day ago",
            recommended_action="Review driver journey management logs and deploy speed radar cameras.",
            acknowledged=True,
            resolved=True
        )
    ]
    for a in demo_alerts:
        db.add(a)
    db.commit()

    # 7. Seed Initial Interventions (HSE Action Workflow)
    demo_interventions = [
        Intervention(
            intervention_id="INT-2025-001",
            report_id="OIL-REP-2025-0001",
            pattern_id="PAT-001",
            title="Site A LOTO Padlock & Multimeter Verification Protocol",
            stage="Action Assigned",
            assigned_to="A. K. Sharma (Senior Electrical Supervisor)",
            site="Site A - Duliajan",
            priority="HIGH",
            corrective_action="Procure 50 master lockout padlocks, conduct LOTO refresher drills, and install physical breaker lock stations at MCC-3.",
            due_date="2025-10-15"
        ),
        Intervention(
            intervention_id="INT-2025-002",
            report_id="OIL-REP-2025-0002",
            pattern_id="PAT-002",
            title="Confined Space Multi-Gas Detector Recalibration & Standby Certification",
            stage="Under Review",
            assigned_to="Dr. P. Borah (HSE Manager)",
            site="Site B - Moran",
            priority="HIGH",
            corrective_action="Audit all optical 4-gas detectors at Moran early production facilities and certify 20 standby watchmen.",
            due_date="2025-10-18"
        ),
        Intervention(
            intervention_id="INT-2025-003",
            pattern_id="PAT-003",
            title="Rig-04 Monkey Board Dual Life-Line Clamp Retrofit",
            stage="Corrective Action",
            assigned_to="P. K. Saikia (Drilling Rig Specialist)",
            site="Site D - Jorhat",
            priority="HIGH",
            corrective_action="Install continuous horizontal lifeline wire along racking finger board to eliminate unhooked transitions.",
            due_date="2025-10-12"
        ),
        Intervention(
            intervention_id="INT-2025-004",
            report_id="OIL-REP-2025-0004",
            title="GGS-2 Flammable Drain Line Valve Replacement",
            stage="Resolved",
            assigned_to="M. Gogoi (Mechanical Maintenance)",
            site="Site E - Naharkatiya",
            priority="MEDIUM",
            corrective_action="Replaced leaking drain ball valve with double-block-and-bleed valve assembly.",
            due_date="2025-09-28"
        )
    ]
    for i in demo_interventions:
        db.add(i)
    db.commit()

    print("[Database] All seed data successfully populated!")
