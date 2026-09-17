import json
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class IOGPRuleMatcher:
    def __init__(self, rules_json_path=None):
        if rules_json_path is None:
            rules_json_path = Path(__file__).resolve().parent.parent.parent / "data" / "iogp_rules.json"
        self.rules_json_path = Path(rules_json_path)
        self.rules = []
        self.vectorizer = None
        self.rule_vectors = None
        self._load_and_index_rules()

    def _load_and_index_rules(self):
        if not self.rules_json_path.exists():
            raise FileNotFoundError(f"IOGP rules file missing: {self.rules_json_path}")

        with open(self.rules_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.rules = data.get("rules", [])

        # Build corpus of rule representations (name + description + keywords + barriers)
        rule_texts = []
        for r in self.rules:
            combined = (
                f"{r['name']} {r['name']} {r['description']} "
                f"{' '.join(r.get('keywords', []))} "
                f"{' '.join(r.get('mandatory_barriers', []))}"
            )
            rule_texts.append(combined)

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.rule_vectors = self.vectorizer.fit_transform(rule_texts)

    def match(self, text: str, top_k: int = 3) -> dict:
        if not self.rules or self.vectorizer is None:
            return {
                "top_rule": "Work Authorization",
                "confidence": 0.50,
                "matches": []
            }

        input_vec = self.vectorizer.transform([text])
        similarities = cosine_similarity(input_vec, self.rule_vectors)[0]

        # Keyword boost
        text_lower = text.lower()
        scored_rules = []
        for idx, rule in enumerate(self.rules):
            base_sim = float(similarities[idx])
            keyword_matches = sum(1 for kw in rule.get("keywords", []) if kw in text_lower)
            boost = min(0.35, keyword_matches * 0.08)
            final_score = min(0.99, base_sim * 0.75 + boost)
            scored_rules.append((final_score, rule))

        scored_rules.sort(key=lambda x: x[0], reverse=True)

        top_score, top_rule_obj = scored_rules[0]

        matches = [
            {
                "id": r["id"],
                "name": r["name"],
                "iogp_code": r.get("iogp_code", ""),
                "score": round(score, 3),
                "icon": r.get("icon", "ShieldAlert"),
                "mandatory_barriers": r.get("mandatory_barriers", []),
                "recommended_action": r.get("recommended_action", "")
            }
            for score, r in scored_rules[:top_k]
        ]

        return {
            "top_rule": top_rule_obj["name"],
            "top_rule_code": top_rule_obj.get("iogp_code", ""),
            "confidence": round(top_score, 3),
            "mandatory_barriers": top_rule_obj.get("mandatory_barriers", []),
            "recommended_action": top_rule_obj.get("recommended_action", ""),
            "all_matches": matches
        }

rule_matcher = IOGPRuleMatcher()
