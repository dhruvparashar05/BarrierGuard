from fastapi import APIRouter
from ..schemas.schemas import AnalyzeRequest, AnalyzeResponse
from barrierguard.ml.classifier.predictor import predictor
from barrierguard.ml.rule_mapping.matcher import rule_matcher
from barrierguard.ml.extraction.extractor import precursor_extractor
from barrierguard.ml.explainability.explainer import explainer
from barrierguard.ml.embeddings.similarity import similarity_engine

router = APIRouter(prefix="/reports", tags=["Analysis Engine"])

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_report_narrative(payload: AnalyzeRequest):
    # 1. Classify SIF Potential and Score Risk
    pred_res = predictor.predict(payload.description)

    # 2. Extract Precursors & Map Life-Saving Rule
    prec_res = precursor_extractor.extract(payload.description)

    # 3. Match IOGP Rule Details
    rule_res = rule_matcher.match(payload.description)

    # 4. Generate Explainable AI Feature Attribution
    exp_res = explainer.explain(
        payload.description,
        prec_res,
        pred_res["sif_potential"],
        pred_res["probability"]
    )

    # 5. Search for Similar Historical Reports
    similar = similarity_engine.find_similar(
        payload.description,
        top_k=4
    )

    return {
        "sif_potential": pred_res["sif_potential"],
        "probability": pred_res["probability"],
        "risk_score": pred_res["risk_score"],
        "risk_level": pred_res["risk_level"],
        "priority": pred_res["priority"],
        "confidence": pred_res["model_confidence"],
        "life_saving_rule": rule_res["top_rule"],
        "rule_confidence": rule_res["confidence"],
        "precursors": {
            "activity": prec_res.get("activity"),
            "location": prec_res.get("location"),
            "equipment": prec_res.get("equipment"),
            "hazard": prec_res.get("hazard"),
            "barrier_failure": prec_res.get("barrier_failure"),
            "unsafe_act": prec_res.get("unsafe_act"),
            "unsafe_condition": prec_res.get("unsafe_condition"),
            "potential_consequence": prec_res.get("potential_consequence"),
            "life_saving_rule": rule_res["top_rule"],
            "explanation": exp_res
        },
        "explanation": exp_res,
        "mandatory_barriers": rule_res["mandatory_barriers"],
        "recommended_action": rule_res["recommended_action"],
        "similar_historical_reports": similar
    }
