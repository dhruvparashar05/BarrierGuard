import json
from pathlib import Path
from barrierguard.ml.classifier.predictor import predictor
from barrierguard.ml.rule_mapping.matcher import rule_matcher
from barrierguard.ml.extraction.extractor import precursor_extractor
from barrierguard.ml.explainability.explainer import explainer

def test_pipeline():
    sample_text = (
        "During pump maintenance at Site A, technician started work before confirming complete electrical isolation. "
        "Multimeter check later showed 440V live feed."
    )
    print("Testing Pipeline on input:\n", sample_text, "\n")

    # 1. Classification
    pred = predictor.predict(sample_text)
    print("1. Prediction:", json.dumps(pred, indent=2))

    # 2. Rule Match
    rule_res = rule_matcher.match(sample_text)
    print("2. Rule Match:", json.dumps(rule_res, indent=2))

    # 3. Extraction
    extracted = precursor_extractor.extract(sample_text)
    print("3. Precursors:", json.dumps(extracted, indent=2))

    # 4. Explainability
    exp = explainer.explain(sample_text, extracted, pred["sif_potential"], pred["probability"])
    print("4. Explanation:", json.dumps(exp, indent=2))

    assert pred["sif_potential"] is True, "Expected SIF-potential True"
    assert pred["risk_level"] == "HIGH", "Expected Risk Level HIGH"
    assert "Energy Isolation" in rule_res["top_rule"], "Expected Energy Isolation rule"
    print("\n[SUCCESS] Pipeline passed all verification checks!")

if __name__ == "__main__":
    test_pipeline()
