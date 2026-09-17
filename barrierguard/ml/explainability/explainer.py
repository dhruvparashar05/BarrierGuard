from typing import Dict, Any, List
from ..extraction.llm_provider import get_llm_provider

class ExplainabilityEngine:
    def __init__(self):
        self.provider = get_llm_provider()

    def explain(self, text: str, precursors: Dict[str, Any], is_sif: bool, probability: float) -> List[str]:
        # Generate explanatory drivers based on concrete extracted features
        reasons = self.provider.generate_explanation(text, precursors, is_sif)

        rule = precursors.get("life_saving_rule")
        if is_sif and rule:
            reasons.append(f"Direct violation of IOGP Life-Saving Rule: '{rule}'.")

        return reasons

explainer = ExplainabilityEngine()
