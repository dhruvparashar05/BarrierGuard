from pathlib import Path
import re
import joblib

# High-energy keywords that indicate severe industrial danger
HIGH_ENERGY_PATTERNS = [
    r"\b(440\s*v|high\s*voltage|energized|electrocution|arc\s*flash|switchgear|breaker)\b",
    r"\b(h2s|hydrogen\s*sulfide|asphyxiation|toxic\s*gas|confined\s*space|oxygen\s*depletion)\b",
    r"\b(fall\s*from\s*height|20m|24m|derrick|mast|monkey\s*board|unclipped|unsecured\s*harness)\b",
    r"\b(flash\s*fire|vapor\s*cloud|explosion|combustible|hydrocarbon\s*release|crude\s*leak)\b",
    r"\b(suspended\s*load|crane\s*drop|drill\s*collar|whip\s*check|struck\s*by|pipe\s*bundle)\b",
    r"\b(esd|emergency\s*shutdown|overpressure|rupture|safety\s*valve\s*bypassed)\b",
    r"\b(dropped\s*object|falling\s*wrench|drop\s*zone)\b"
]

BARRIER_FAILURE_PATTERNS = [
    r"\b(isolation\s*not\s*verified|no\s*loto|without\s*lockout|unlocked\s*breaker)\b",
    r"\b(missing\s*gas\s*test|without\s*testing|no\s*hole\s*watcher|standby\s*absent)\b",
    r"\b(no\s*tie-off|unhooked|without\s*harness|safety\s*belt\s*missing)\b",
    r"\b(bypassed|overridden|jumpered|tampered)\b",
    r"\b(inadequate\s*permit|no\s*ptw|expired\s*permit|permit\s*missing)\b",
    r"\b(speeding|ivms\s*alert|distracted|phone\s*while\s*driving)\b",
    r"\b(no\s*tagline|line\s*of\s*fire|stood\s*under)\b"
]

class SIFPredictor:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = Path(__file__).resolve().parent / "sif_model.joblib"
        self.model_path = Path(model_path)
        self.model = None
        self._load_model()

    def _load_model(self):
        if self.model_path.exists():
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"[Warning] Failed to load joblib model: {e}")
                self.model = None

    def predict(self, text: str) -> dict:
        text_lower = text.lower()
        model_prob = 0.0

        if self.model is not None:
            try:
                probs = self.model.predict_proba([text])[0]
                model_prob = float(probs[1])
            except Exception as e:
                print(f"[Warning] Inference error on model: {e}")
                model_prob = 0.0

        # Heuristic Safety Ensemble Score
        heuristic_score = 0.0
        high_energy_hits = sum(1 for pat in HIGH_ENERGY_PATTERNS if re.search(pat, text_lower))
        barrier_failure_hits = sum(1 for pat in BARRIER_FAILURE_PATTERNS if re.search(pat, text_lower))

        if high_energy_hits >= 1 and barrier_failure_hits >= 1:
            heuristic_score = 0.88 + min(0.10, (high_energy_hits + barrier_failure_hits) * 0.03)
        elif high_energy_hits >= 1 or barrier_failure_hits >= 1:
            heuristic_score = 0.65
        else:
            heuristic_score = 0.15

        # Blended Probability
        if self.model is not None:
            final_prob = 0.65 * model_prob + 0.35 * heuristic_score
        else:
            final_prob = heuristic_score

        final_prob = min(0.99, max(0.01, final_prob))
        sif_potential = final_prob >= 0.50

        # Calculate Prototype Risk Score (0.0 to 1.0)
        risk_score = round(final_prob, 2)
        if risk_score >= 0.70:
            risk_level = "HIGH"
            priority = "HIGH"
        elif risk_score >= 0.40:
            risk_level = "MEDIUM"
            priority = "MEDIUM"
        else:
            risk_level = "LOW"
            priority = "LOW"

        return {
            "sif_potential": sif_potential,
            "probability": round(final_prob, 3),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "priority": priority,
            "model_version": "v1.2-sih-hybrid",
            "model_confidence": round(abs(final_prob - 0.50) * 2, 2)
        }

# Global singleton instance
predictor = SIFPredictor()
