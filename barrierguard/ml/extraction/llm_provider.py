import os
import json
import re
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseLLMProvider(ABC):
    @abstractmethod
    def extract_precursors(self, text: str) -> Dict[str, Any]:
        """Extract structured precursor JSON from report narrative."""
        pass

    @abstractmethod
    def generate_explanation(self, text: str, structured_data: Dict[str, Any], is_sif: bool) -> list[str]:
        """Generate human-readable explainable AI bullet points."""
        pass


class MockRuleBasedProvider(BaseLLMProvider):
    """
    High-fidelity deterministic NLP extractor tailored for Oil India Limited operations.
    Provides robust, instantaneous extraction even without external network/API keys.
    """

    ACTIVITIES = [
        ("Pump Maintenance", [r"pump", r"impeller", r"centrifugal", r"seal\s*replacement"]),
        ("Vessel Entry & Tank Cleaning", [r"vessel", r"separator", r"tank\s*entry", r"manway", r"confined\s*space"]),
        ("Working at Height", [r"derrick", r"monkey\s*board", r"mast", r"scaffold", r"height", r"ladder", r"elevation"]),
        ("Hot Work & Welding", [r"weld", r"grind", r"torch", r"cutting", r"flame", r"hot\s*work", r"spark"]),
        ("Crane & Mechanical Lifting", [r"crane", r"rigging", r"sling", r"suspended\s*load", r"hoist", r"drill\s*collar"]),
        ("Crude Transport & Driving", [r"tanker", r"bowser", r"driving", r"truck", r"speed", r"ivms", r"vehicle"]),
        ("Gas Processing & Compression", [r"compressor", r"esd", r"gas\s*plant", r"interlock", r"overpressure"]),
        ("Electrical Switchgear Servicing", [r"switchgear", r"mcc", r"breaker", r"substation", r"transformer"]),
        ("Pipeline Maintenance", [r"pipeline", r"flange", r"pigging", r"right\s*of\s*way", r"trunkline"]),
        ("Routine Walkaround Inspection", [r"walkaround", r"routine", r"housekeeping", r"dust", r"sweeping", r"ergonomic"])
    ]

    BARRIERS = [
        ("Isolation Not Verified", [r"isolation", r"zero\s*energy", r"loto", r"lockout", r"tagout", r"breaker\s*unlocked"]),
        ("Missing Gas Testing & Hole Watcher", [r"gas\s*test", r"hole\s*watch", r"standby", r"h2s", r"toxic"]),
        ("Missing 100% Fall Arrest Tie-Off", [r"tie-off", r"unclipped", r"unhooked", r"harness", r"lanyard"]),
        ("Inadequate Hot Work Permit & Fire Watch", [r"fire\s*watch", r"fire\s*blanket", r"hot\s*work\s*permit"]),
        ("Personnel In Line of Fire & Missing Tagline", [r"line\s*of\s*fire", r"tagline", r"under\s*suspended\s*load"]),
        ("Unauthorized Safety Interlock Jumpering", [r"bypass", r"jumper", r"override", r"interlock"]),
        ("Speed Limit & Journey Policy Violation", [r"speeding", r"overspeed", r"mobile\s*phone\s*while\s*driving"]),
        ("Missing Tool Lanyard / Secondary Retention", [r"dropped\s*object", r"tool\s*lanyard", r"tether", r"drops"])
    ]

    HAZARDS = [
        ("440V Uncontrolled Electrical Energy", [r"440v", r"high\s*voltage", r"electrical", r"energized", r"live\s*cable"]),
        ("Toxic H2S Gas & Oxygen Depletion", [r"h2s", r"hydrogen\s*sulfide", r"asphyxiation", r"toxic\s*gas"]),
        ("Fall from Height (>20 meters)", [r"24m", r"20m", r"derrick", r"mast", r"height", r"elevated"]),
        ("Flammable Hydrocarbon Vapor & Ignition Source", [r"vapor", r"flammable", r"condensate", r"sparks", r"hydrocarbon"]),
        ("Suspended 4-Ton Load & Dropped Object", [r"suspended", r"crane", r"sling", r"drill\s*collar", r"dropped\s*object"]),
        ("Overpressure Hydrocarbon Rupture (120 bar)", [r"overpressure", r"rupture", r"esd", r"compressor"]),
        ("High Kinetic Energy & Flammable Cargo", [r"tanker", r"bowser", r"overspeed", r"rollover"]),
        ("Minor Trip Hazard", [r"rag", r"bucket", r"grating", r"corridor", r"walkway"])
    ]

    EQUIPMENT = [
        ("Centrifugal Booster Pump P-204", [r"pump", r"impeller", r"motor"]),
        ("Production Test Separator V-101", [r"separator", r"vessel", r"tank"]),
        ("Drilling Rig Mast Monkey Board (24m)", [r"derrick", r"monkey\s*board", r"mast", r"rig"]),
        ("8-inch Crude Trunkline Header", [r"trunkline", r"pipe", r"flange", r"pipeline"]),
        ("50-Ton Hydraulic Mobile Crane", [r"crane", r"hoist", r"sling"]),
        ("30KL Heavy Crude Road Bowser", [r"tanker", r"bowser", r"truck", r"vehicle"]),
        ("High Pressure Gas Compressor K-01", [r"compressor", r"cylinder", r"esd"]),
        ("MCC Electrical Distribution Panel", [r"switchgear", r"mcc", r"breaker", r"panel"])
    ]

    def extract_precursors(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()

        # Extract Activity
        activity = "General Operational Maintenance"
        for act_name, patterns in self.ACTIVITIES:
            if any(re.search(p, text_lower) for p in patterns):
                activity = act_name
                break

        # Extract Barrier Failure
        barrier = "Procedural Adherence Non-Compliance"
        for bar_name, patterns in self.BARRIERS:
            if any(re.search(p, text_lower) for p in patterns):
                barrier = bar_name
                break

        # Extract Hazard
        hazard = "Standard Industrial Workplace Hazard"
        for haz_name, patterns in self.HAZARDS:
            if any(re.search(p, text_lower) for p in patterns):
                hazard = haz_name
                break

        # Extract Equipment
        equipment = "Facility Equipment"
        for eq_name, patterns in self.EQUIPMENT:
            if any(re.search(p, text_lower) for p in patterns):
                equipment = eq_name
                break

        # Extract Location
        location = "OIL Operational Field Facility"
        loc_match = re.search(r"at\s+([A-Z0-9\s\-]+?)(?=[,\.\;]|prior|before|during)", text)
        if loc_match and len(loc_match.group(1).strip()) > 3:
            location = loc_match.group(1).strip()

        # Unsafe Act & Condition
        unsafe_act = "Task commenced without verifying critical physical barriers"
        if "without" in text_lower or "before" in text_lower or "prior to" in text_lower:
            parts = re.split(r"(?:without|before|prior to)", text, flags=re.IGNORECASE)
            if len(parts) > 1:
                unsafe_act = ("Proceeded " + parts[1].strip().split(".")[0])[:90]

        unsafe_condition = "Safety control interlock or physical barrier missing/unverified"
        if "missing" in text_lower or "failed" in text_lower or "tripped" in text_lower or "unlocked" in text_lower:
            cond_match = re.search(r"([^,\.;]+(?:missing|failed|unlocked|absent|bypassed)[^,\.;]+)", text, re.IGNORECASE)
            if cond_match:
                unsafe_condition = cond_match.group(1).strip()[:90]

        # Potential Consequence
        potential_consequence = "Loss of containment or direct personnel injury"
        if "electrocution" in text_lower or "440v" in text_lower or "voltage" in text_lower:
            potential_consequence = "Severe arc flash explosion and fatal electrocution"
        elif "h2s" in text_lower or "asphyxiation" in text_lower or "vessel" in text_lower:
            potential_consequence = "Asphyxiation and fatal toxic gas inhalation"
        elif "height" in text_lower or "derrick" in text_lower or "tie-off" in text_lower:
            potential_consequence = "Uncontrolled fatal fall from height"
        elif "fire" in text_lower or "weld" in text_lower or "spark" in text_lower:
            potential_consequence = "Vapor cloud explosion and catastrophic flash fire"
        elif "crane" in text_lower or "suspended" in text_lower or "line of fire" in text_lower:
            potential_consequence = "Crushing blunt force trauma from dropped load"
        elif "speed" in text_lower or "tanker" in text_lower:
            potential_consequence = "Rollover collision and massive hydrocarbon spill"

        return {
            "activity": activity,
            "location": location,
            "equipment": equipment,
            "hazard": hazard,
            "barrier_failure": barrier,
            "unsafe_act": unsafe_act,
            "unsafe_condition": unsafe_condition,
            "potential_consequence": potential_consequence
        }

    def generate_explanation(self, text: str, structured_data: Dict[str, Any], is_sif: bool) -> list[str]:
        if not is_sif:
            return [
                "Incident narrative describes low-energy workplace observation.",
                f"Hazard evaluated as {structured_data.get('hazard', 'minor hazard')} without immediate fatal potential.",
                "No primary IOGP Life-Saving Rule barriers bypassed.",
                "Suitable for localized corrective action and routine monitoring."
            ]

        explanations = [
            f"Mentions high-risk activity: {structured_data.get('activity', 'critical operational activity')}.",
            f"Active critical barrier breakdown detected: {structured_data.get('barrier_failure', 'unverified barrier')}.",
            f"Worker or facility exposed to high-severity hazard: {structured_data.get('hazard', 'stored energy')}.",
            f"Credible worst-case potential consequence: {structured_data.get('potential_consequence', 'serious injury')}."
        ]
        return explanations


class OpenAICompatibleProvider(BaseLLMProvider):
    def __init__(self, api_key: str, base_url: Optional[str] = None, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.base_url = base_url or "https://api.openai.com/v1"
        self.model = model
        self.fallback = MockRuleBasedProvider()

    def extract_precursors(self, text: str) -> Dict[str, Any]:
        import httpx
        system_prompt = (
            "You are an industrial HSE expert for Oil India Limited. "
            "Extract structured safety precursor entities from the report narrative. "
            "Respond ONLY with a JSON object containing keys: activity, location, equipment, "
            "hazard, barrier_failure, unsafe_act, unsafe_condition, potential_consequence."
        )
        try:
            resp = httpx.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": text}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1
                },
                timeout=12.0
            )
            if resp.status_code == 200:
                data = resp.json()["choices"][0]["message"]["content"]
                return json.loads(data)
        except Exception as e:
            print(f"[LLM Warning] OpenAI API failed ({e}), falling back to deterministic extractor.")
        return self.fallback.extract_precursors(text)

    def generate_explanation(self, text: str, structured_data: Dict[str, Any], is_sif: bool) -> list[str]:
        return self.fallback.generate_explanation(text, structured_data, is_sif)


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model = model
        self.fallback = MockRuleBasedProvider()

    def extract_precursors(self, text: str) -> Dict[str, Any]:
        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        prompt = (
            "You are an HSE Safety Expert for Oil India Limited. Extract structured precursors from this report: "
            f"\"{text}\". Return valid JSON with keys: activity, location, equipment, hazard, barrier_failure, "
            "unsafe_act, unsafe_condition, potential_consequence."
        )
        try:
            resp = httpx.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=12.0
            )
            if resp.status_code == 200:
                text_resp = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                # Extract JSON from markdown fences if any
                clean_json = re.sub(r"^```(?:json)?\s*|\s*```$", "", text_resp.strip(), flags=re.MULTILINE)
                return json.loads(clean_json)
        except Exception as e:
            print(f"[LLM Warning] Gemini API failed ({e}), falling back to deterministic extractor.")
        return self.fallback.extract_precursors(text)

    def generate_explanation(self, text: str, structured_data: Dict[str, Any], is_sif: bool) -> list[str]:
        return self.fallback.generate_explanation(text, structured_data, is_sif)


def get_llm_provider() -> BaseLLMProvider:
    """Factory creating the appropriate LLM provider based on environment variables."""
    provider_type = os.getenv("LLM_PROVIDER", "").upper()
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if (provider_type == "OPENAI" or openai_key) and openai_key:
        return OpenAICompatibleProvider(
            api_key=openai_key,
            base_url=os.getenv("OPENAI_BASE_URL"),
            model=os.getenv("LLM_MODEL", "gpt-4o-mini")
        )
    elif (provider_type == "GEMINI" or gemini_key) and gemini_key:
        return GeminiProvider(
            api_key=gemini_key,
            model=os.getenv("LLM_MODEL", "gemini-1.5-flash")
        )

    # Default offline high-precision deterministic provider
    return MockRuleBasedProvider()
