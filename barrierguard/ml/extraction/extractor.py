from typing import Dict, Any
from .llm_provider import get_llm_provider
from ..rule_mapping.matcher import rule_matcher

class PrecursorExtractor:
    def __init__(self):
        self.provider = get_llm_provider()

    def extract(self, text: str) -> Dict[str, Any]:
        # Extract precursor entities via active provider
        precursors = self.provider.extract_precursors(text)

        # Match IOGP Life-Saving Rule
        rule_match = rule_matcher.match(text)
        precursors["life_saving_rule"] = rule_match["top_rule"]
        precursors["rule_confidence"] = rule_match["confidence"]
        precursors["mandatory_barriers"] = rule_match["mandatory_barriers"]
        precursors["recommended_action"] = rule_match["recommended_action"]

        return precursors

precursor_extractor = PrecursorExtractor()
