from collections import defaultdict
from typing import List, Dict, Any

class PatternDetector:
    def detect_patterns(self, reports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Group reports by (activity, barrier_failure, life_saving_rule, site)
        clusters = defaultdict(list)

        for r in reports:
            precursors = r.get("precursors", {})
            act = precursors.get("activity") or "General Operations"
            barrier = precursors.get("barrier_failure") or "General Failure"
            rule = r.get("life_saving_rule") or precursors.get("life_saving_rule") or "Work Authorization"
            site = r.get("site") or "Site A - Duliajan"

            key = (act, barrier, rule, site)
            clusters[key].append(r)

        patterns = []
        pattern_id = 1

        for (act, barrier, rule, site), rep_list in clusters.items():
            count = len(rep_list)
            # Only consider clusters with recurring count >= 3
            if count < 3:
                continue

            sif_count = sum(1 for x in rep_list if x.get("sif_potential", False))
            sif_percentage = round((sif_count / count) * 100, 1)
            avg_risk = round(sum(x.get("risk_score", 0.5) for x in rep_list) / count, 2)

            # Determine risk tier
            if avg_risk >= 0.70 or sif_percentage >= 50.0:
                risk_tier = "HIGH RISK"
                risk_level = "HIGH"
            elif avg_risk >= 0.40 or sif_percentage >= 20.0:
                risk_tier = "MEDIUM RISK"
                risk_level = "MEDIUM"
            else:
                risk_tier = "LOW RISK"
                risk_level = "LOW"

            # Compute trend by comparing dates in last 45 days vs earlier
            rep_list_sorted = sorted(rep_list, key=lambda x: x.get("date", ""), reverse=True)
            recent_count = sum(1 for x in rep_list[:count // 2])
            trend = "Increasing" if recent_count >= count * 0.55 else "Stable"

            # Primary equipment involved
            equip_counts = defaultdict(int)
            for x in rep_list:
                eq = x.get("precursors", {}).get("equipment", "Field Equipment")
                equip_counts[eq] += 1
            top_equipment = max(equip_counts.items(), key=lambda item: item[1])[0] if equip_counts else "Field Equipment"

            # Recommended proactive intervention
            rec_action = (
                f"Mandate supervisory stand-down and barrier re-certification for {act} at {site}. "
                f"Enforce mandatory checklist audit for '{barrier}' under IOGP {rule}."
            )

            patterns.append({
                "id": f"PAT-{pattern_id:03d}",
                "name": f"{act} + {barrier}",
                "activity": act,
                "barrier_failure": barrier,
                "life_saving_rule": rule,
                "site": site,
                "equipment": top_equipment,
                "occurrences": count,
                "sif_reports_count": sif_count,
                "sif_percentage": sif_percentage,
                "average_risk_score": avg_risk,
                "risk_tier": risk_tier,
                "risk_level": risk_level,
                "trend": trend,
                "recommended_action": rec_action,
                "sample_reports": [
                    {
                        "id": x.get("id"),
                        "title": x.get("title"),
                        "date": x.get("date"),
                        "risk_score": x.get("risk_score")
                    }
                    for x in rep_list_sorted[:4]
                ]
            })
            pattern_id += 1

        # Sort patterns by occurrences and risk score descending
        patterns.sort(key=lambda p: (p["risk_level"] == "HIGH", p["occurrences"], p["average_risk_score"]), reverse=True)
        return patterns

pattern_detector = PatternDetector()
