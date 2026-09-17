import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Fix random seed for reproducible synthetic dataset
random.seed(42)

SITES = [
    {"code": "SITE-A", "name": "Site A - Duliajan", "field": "Central Production & Field HQ"},
    {"code": "SITE-B", "name": "Site B - Moran", "field": "Production Wells & Workover"},
    {"code": "SITE-C", "name": "Site C - Digboi", "field": "Refinery & Heavy Maintenance"},
    {"code": "SITE-D", "name": "Site D - Jorhat", "field": "Exploration & Rig Operations"},
    {"code": "SITE-E", "name": "Site E - Naharkatiya", "field": "Gas Plant & Pipeline Network"},
]

DEPARTMENTS = [
    "Production Operations",
    "Drilling & Workover",
    "Mechanical Maintenance",
    "Electrical & Instrumentation",
    "Pipeline & Gathering",
    "Logistics & Transport",
    "Quality & HSE Inspection"
]

REPORTERS = [
    ("R. K. Barua", "Field Production Engineer"),
    ("M. Gogoi", "Mechanical Maintenance Technician"),
    ("A. K. Sharma", "Senior Electrical Supervisor"),
    ("P. K. Saikia", "Drilling Rig Specialist"),
    ("B. Borah", "Pipeline Inspection Officer"),
    ("D. Phukan", "HSE Safety Officer"),
    ("N. Sonowal", "Wellhead Maintenance Foreman"),
    ("S. Roy", "Heavy Transport Fleet Driver"),
    ("K. Chutia", "Instrument Calibration Tech"),
    ("T. Neog", "Civil Scaffolding Lead")
]

# Patterns for SIF Scenarios
SIF_PATTERNS = [
    {
        "pattern_name": "Pump Isolation Failure during Maintenance",
        "activity": "Pump Maintenance",
        "equipment": "Centrifugal Crude Booster Pump P-204",
        "hazard": "440V Electrical & Pressurized Hydrocarbon",
        "barrier_failure": "Isolation Not Verified",
        "unsafe_act": "Commenced bolt removal and cable disconnect before checking for zero electrical energy",
        "unsafe_condition": "MCC breaker panel lock missing tag and padlocks",
        "potential_consequence": "Arc flash explosion and fatal electrocution",
        "life_saving_rule": "Energy Isolation",
        "location": "Crude Pump Station 3",
        "site": "Site A - Duliajan",
        "template": (
            "During scheduled pump maintenance on centrifugal booster pump {equip} at {loc}, the technician "
            "started disassembling the motor terminal box before confirming complete electrical LOTO isolation. "
            "Subsequent multimeter check revealed live 440V supply to the breaker. No physical lockout tag was affixed."
        ),
        "explanation": [
            "Maintenance activity initiated on electrical/mechanical pumping system without verified zero-energy state.",
            "Primary administrative barrier (LOTO isolation verification certificate) was bypassed.",
            "Worker was in direct physical proximity to live 440V terminal conductors.",
            "Violates IOGP Energy Isolation mandatory rule."
        ],
        "weight": 85
    },
    {
        "pattern_name": "Confined Space Entry Without Gas Test",
        "activity": "Vessel Entry & Cleaning",
        "equipment": "Production Test Separator V-101",
        "hazard": "Toxic H2S Gas & Oxygen Depletion",
        "barrier_failure": "Missing Gas Testing & Standby Watch",
        "unsafe_act": "Contractor stepped inside vessel manway without waiting for calibrated gas test results",
        "unsafe_condition": "Sludge residues emitting localized H2S pockets (>25 ppm)",
        "potential_consequence": "Asphyxiation and fatal toxic gas inhalation",
        "life_saving_rule": "Confined Space",
        "location": "Early Production Facility Manifold",
        "site": "Site B - Moran",
        "template": (
            "During vessel cleaning of test separator {equip} at {loc}, contractor entered the vessel interior "
            "prior to mandatory 4-gas atmospheric testing. Standby hole-watcher was absent from the entry hatch. "
            "Continuous forced air ventilation fan had tripped 10 minutes earlier unnoticed."
        ),
        "explanation": [
            "Unauthorized entry into enclosed production vessel containing residual hydrocarbon sludge.",
            "Critical barrier failure: multi-gas testing not performed prior to manway entry.",
            "No qualified standby watchman posted at entry point.",
            "High probability of instantaneous unconsciousness from H2S gas pocket."
        ],
        "weight": 70
    },
    {
        "pattern_name": "Derrick Mast Work Without 100% Tie-Off",
        "activity": "Working at Height",
        "equipment": "Drilling Rig Mast Monkey Board (24m)",
        "hazard": "Fall from Height (>20 meters)",
        "barrier_failure": "Missing 100% Fall Arrest Tie-Off",
        "unsafe_act": "Derrickman unhooked twin-tail lanyard while transitioning between fingers without intermediate anchor",
        "unsafe_condition": "Greasy safety harness lanyard and missing intermediate life-line clamp",
        "potential_consequence": "Uncontrolled fatal fall from 24 meters to rig floor",
        "life_saving_rule": "Working at Height",
        "location": "Rig-04 Derrick Floor",
        "site": "Site D - Jorhat",
        "template": (
            "During tripping pipe operation at {loc}, the derrickman on the monkey board unclipped both harness lanyards "
            "simultaneously while moving across racking fingers at 24 meters height. Worker had zero fall protection "
            "for approximately 45 seconds over an open drop."
        ),
        "explanation": [
            "Work performed at extreme elevation (24m) without positive fall restraint or 100% dual tie-off.",
            "Complete failure of individual fall arrest barrier during elevated pipe racking.",
            "Direct potential for catastrophic fatal blunt force trauma on rig substructure.",
            "Violates IOGP Working at Height Life-Saving Rule."
        ],
        "weight": 65
    },
    {
        "pattern_name": "Pipeline Hot Work In Flammable Vapor Zone",
        "activity": "Hot Work & Welding",
        "equipment": "8-inch Crude Trunkline Header",
        "hazard": "Flammable Hydrocarbon Vapor & Ignition Source",
        "barrier_failure": "Inadequate Hot Work Permit & Missing Fire Blanket",
        "unsafe_act": "Welder struck electric arc on flange spool while cold drain line valve was weeping condensate",
        "unsafe_condition": "LEL combustible gas detector alarm setpoint was bypassed; wind blew vapors toward sparks",
        "potential_consequence": "Catastrophic pipeline fire / vapor cloud explosion",
        "life_saving_rule": "Hot Work",
        "location": "Gathering Station GGS-2",
        "site": "Site E - Naharkatiya",
        "template": (
            "During tie-in welding on {equip} at {loc}, sparks landed near an unblinded drain nozzle that had a minor "
            "condensate weep. Portable gas monitor had not been re-zeroed and the fire watch had stepped away to fetch "
            "water. Flash fire potential was averted when nearby operator shouted to halt."
        ),
        "explanation": [
            "Hot work ignition source introduced in proximity to uncontained flammable hydrocarbon vapors.",
            "Fire watch barrier abandoned and combustible gas testing was overdue.",
            "Active liquid hydrocarbon weeping within the 15-meter hot work exclusion boundary.",
            "Violates IOGP Hot Work Rule."
        ],
        "weight": 55
    },
    {
        "pattern_name": "Heavy Drill Pipe Lifting in Line of Fire",
        "activity": "Crane & Mechanical Lifting",
        "equipment": "50-Ton Hydraulic Mobile Crane & 9-inch Drill Collars",
        "hazard": "Suspended 4-Ton Load & Rigging Snag",
        "barrier_failure": "Personnel In Line of Fire & Missing Tagline",
        "unsafe_act": "Roustabout stood directly under slewing 4-ton drill collar bundle without using guide tagline",
        "unsafe_condition": "Frayed wire rope sling with broken outer strands exceeded rejection criteria",
        "potential_consequence": "Crushing fatality from dropped load",
        "life_saving_rule": "Line of Fire",
        "location": "Drilling Tubular Pipe Rack",
        "site": "Site D - Jorhat",
        "template": (
            "During offloading of 4-ton drill collars with 50-ton mobile crane at {loc}, roustabout stood directly "
            "beneath the suspended load path while manually pushing the pipe bundle instead of using taglines. "
            "Rigging sling shifted abruptly on hook saddle."
        ),
        "explanation": [
            "Personnel positioned directly underneath unsupported overhead suspended load.",
            "Failure to establish drop zone exclusion barricade or use non-contact guide taglines.",
            "Inspection barrier bypassed: wire rope sling showed structural strand fraying.",
            "Violates IOGP Line of Fire and Safe Mechanical Lifting Rules."
        ],
        "weight": 50
    },
    {
        "pattern_name": "Crude Oil Bowsers Speeding on Corridors",
        "activity": "Crude Transport & Tanker Driving",
        "equipment": "30KL Heavy Crude Oil Road Bowser",
        "hazard": "High Kinetic Energy & Flammable Cargo",
        "barrier_failure": "Speed Limit Violation & Distracted Driving",
        "unsafe_act": "Driver exceeded posted 30 km/h oilfield speed limit reaching 68 km/h while handling phone",
        "unsafe_condition": "Narrow unpaved bund road with loose gravel and sharp turn near high-pressure manifold",
        "potential_consequence": "Tanker rollover, massive spill, and fatal collision",
        "life_saving_rule": "Driving",
        "location": "Wellhead Corridor Road #4",
        "site": "Site B - Moran",
        "template": (
            "Loaded 30KL crude oil tanker {equip} logged speed of 68 km/h on narrow single-lane gravel road at {loc}. "
            "In-vehicle monitoring (IVMS) triggered severe overspeed alert. Driver swerved violently to avoid an oncoming "
            "crew van, almost rolling over the pressurized road embankment."
        ),
        "explanation": [
            "Heavy tanker operated at more than double the posted safe industrial speed limit.",
            "Driver attention diverted by mobile communication device while transporting hazardous flammable cargo.",
            "Vehicle stability compromised on degraded unpaved oilfield track.",
            "Violates IOGP Driving Life-Saving Rule."
        ],
        "weight": 40
    },
    {
        "pattern_name": "Emergency Shutdown ESD Interlock Bypassed",
        "activity": "Gas Processing & Compressor Operation",
        "equipment": "Reciprocating High Pressure Gas Compressor K-01",
        "hazard": "Overpressure Hydrocarbon Rupture (120 bar)",
        "barrier_failure": "Unauthorized Safety Interlock Jumpering",
        "unsafe_act": "Operator installed temporary wire jumper across high discharge pressure ESD transmitter without MOC",
        "unsafe_condition": "Vibration levels on 3rd stage cylinder escalating above design threshold",
        "potential_consequence": "Catastrophic compressor head explosion and fire",
        "life_saving_rule": "Bypassing Safety Controls",
        "location": "Gas Compression Plant #2",
        "site": "Site E - Naharkatiya",
        "template": (
            "During startup of gas compressor {equip} at {loc}, high pressure ESD trip interlock was found bypassed with an "
            "unauthorized electrical bridging clip in the DCS marshalling rack. No Management of Change (MOC) or override "
            "risk assessment had been registered."
        ),
        "explanation": [
            "Critical automated safety safeguard (Emergency Shutdown Interlock) bypassed without engineering authorization.",
            "Leaves high pressure gas processing unit operating without primary overpressure protection.",
            "High potential for catastrophic rupture of gas header under transient surge.",
            "Violates IOGP Bypassing Safety Controls Life-Saving Rule."
        ],
        "weight": 45
    },
    {
        "pattern_name": "Overhead Heavy Tool Dropped From Derrick",
        "activity": "Derrick Maintenance & Casing Run",
        "equipment": "36-inch Rigid Heavy Pipe Wrench",
        "hazard": "Dropped Object Impact (Kinetic Energy > 120 Joules)",
        "barrier_failure": "Missing Tool Lanyard & Inadequate Barricading",
        "unsafe_act": "Technician laid heavy 36-inch pipe wrench on un-toeboarded grating edge at 18m without tethering",
        "unsafe_condition": "Severe wind gusts (35 knots) vibrating derrick platform",
        "potential_consequence": "Fatal blunt impact to personnel on rig sub-structure",
        "life_saving_rule": "Dropped Objects",
        "location": "Derrick Service Platform (18m)",
        "site": "Site C - Digboi",
        "template": (
            "During casing make-up at {loc}, a 7kg pipe wrench slipped off an elevated beam at 18 meters height and "
            "plummeted to the rotary floor, impacting 1.5 meters from the driller console. Tool was untethered and "
            "red drop-zone barricading tape had not been erected."
        ),
        "explanation": [
            "Heavy hand tool utilized at elevation without certified secondary retention tether.",
            "Drop zone below active elevated work was not cordoned off.",
            "Kinetic impact energy of dropped object exceeds fatal threshold.",
            "Violates IOGP Dropped Objects Safety Rule."
        ],
        "weight": 40
    }
]

# Non-SIF Scenarios (Low-risk slips, housekeeping, documentation, minor PPE, ergonomics)
NON_SIF_SCENARIOS = [
    {
        "activity": "Routine Housekeeping",
        "hazard": "Minor Trip Hazard",
        "equipment": "Walkway Grating",
        "barrier_failure": "Untidy Storage",
        "unsafe_act": "Left spare cleaning rags and plastic wash bucket on designated walkway",
        "unsafe_condition": "Narrow pathway obstructed by empty plastic drum",
        "potential_consequence": "Minor ankle twist or superficial stumble",
        "life_saving_rule": "Work Authorization",
        "template": (
            "Observed plastic cleaning bucket and grease rags left on the main access corridor walkway at {loc}. "
            "Housekeeping was completed shortly after notification. No direct high energy or acute life-safety risk."
        ),
        "explanation": [
            "Low energy incident involving minor tripping hazard.",
            "No high-energy source, flammable hydrocarbons, or falling risk present.",
            "Classified as routine low-risk non-SIF observation."
        ],
        "sif": False,
        "risk_range": (0.10, 0.28),
        "priority": "LOW"
    },
    {
        "activity": "Office & Workshop Admin",
        "hazard": "Ergonomic Strain",
        "equipment": "Office Chair & Desktop Monitor",
        "barrier_failure": "Non-compliant Posture",
        "unsafe_act": "Adjusted workstation monitor too low causing neck strain during data entry",
        "unsafe_condition": "Worn-out chair armrest in shift supervisor office",
        "potential_consequence": "Mild muscular strain",
        "life_saving_rule": "Work Authorization",
        "template": (
            "Routine ergonomic check at {loc} noted operator sitting with poor back posture while updating wellhead logs. "
            "Chair height was readjusted. No immediate physical danger."
        ),
        "explanation": [
            "Ergonomic workplace concern without acute physical hazard.",
            "No serious injury or fatality potential.",
            "Classified as low priority non-SIF item."
        ],
        "sif": False,
        "risk_range": (0.08, 0.22),
        "priority": "LOW"
    },
    {
        "activity": "Routine Walkaround Inspection",
        "hazard": "Cosmetic Paint Peeling / Mild Rust",
        "equipment": "Outdoor Cable Tray Cover",
        "barrier_failure": "Weathering Wear",
        "unsafe_act": "Noted weather degradation without logging work order",
        "unsafe_condition": "Minor surface corrosion on non-structural galvanized sheet metal",
        "potential_consequence": "Cosmetic asset weathering",
        "life_saving_rule": "Work Authorization",
        "template": (
            "During perimeter fence and yard walkaround at {loc}, noticed paint peeling and light surface rust on cable tray "
            "weather shield. Cables inside are fully intact and insulated. Reported for regular quarterly painting."
        ),
        "explanation": [
            "Asset integrity cosmetic issue without electrical exposure or mechanical failure.",
            "Non-critical environmental aging.",
            "Classified as Non-SIF."
        ],
        "sif": False,
        "risk_range": (0.12, 0.32),
        "priority": "LOW"
    },
    {
        "activity": "PPE Compliance Verification",
        "hazard": "Mild Dust Particles",
        "equipment": "Standard Safety Spectacles",
        "barrier_failure": "Improper PPE Storage",
        "unsafe_act": "Technician resting safety goggles on hard hat instead of eyes while sweeping dry concrete apron",
        "unsafe_condition": "Windborne dust on concrete apron",
        "potential_consequence": "Mild eye irritation from dust",
        "life_saving_rule": "Work Authorization",
        "template": (
            "Noted technician sweeping dust at {loc} with safety glasses perched on hard hat rim rather than over eyes. "
            "Advised on 100% eye protection compliance; worker corrected immediately."
        ),
        "explanation": [
            "Minor PPE non-conformance during non-hazardous sweeping task.",
            "No chemical splash or flying metallic debris.",
            "Classified as low-risk Non-SIF."
        ],
        "sif": False,
        "risk_range": (0.15, 0.35),
        "priority": "LOW"
    },
    {
        "activity": "Routine Fluid Top-up",
        "hazard": "Minor Coolant Drip",
        "equipment": "Diesel Generator Auxiliary Radiator",
        "barrier_failure": "Slight Hose Seepage",
        "unsafe_act": "Added distilled water coolant while engine was warm without checking overflow tray",
        "unsafe_condition": "Small puddle (approx 200ml) of green radiator coolant on concrete drip pad",
        "potential_consequence": "Localized slip hazard on pad",
        "life_saving_rule": "Work Authorization",
        "template": (
            "Small coolant leak (approx 200ml) observed beneath generator radiator hose connection at {loc}. "
            "Drip tray captured fluid; hose clamp tightened and coolant wiped clean. Generator operating normally."
        ),
        "explanation": [
            "Low-temperature coolant leakage contained in environmental bund.",
            "No pressurized steam release or flammable fluids involved.",
            "Classified as low-risk Non-SIF."
        ],
        "sif": False,
        "risk_range": (0.18, 0.38),
        "priority": "LOW"
    },
    {
        "activity": "Warehouse Material Stacking",
        "hazard": "Stack Stability",
        "equipment": "Wooden Pallet with Spare Valve Packing Boxes",
        "barrier_failure": "Stack Height Exceeded Guidelines",
        "unsafe_act": "Stacked spare gasket cardboard cartons 4 layers high instead of recommended 3 layers",
        "unsafe_condition": "Top carton slightly leaning inside sheltered warehouse",
        "potential_consequence": "Light cardboard box falling on floor",
        "life_saving_rule": "Work Authorization",
        "template": (
            "Cardboard packaging boxes containing Teflon valve packing seals stacked 4 boxes high in warehouse aisle at {loc}. "
            "Material handler restacked pallet to 2 tiers to conform with standard warehouse guidelines."
        ),
        "explanation": [
            "Lightweight material handling in enclosed indoor storage.",
            "Maximum box weight <3kg; no high kinetic energy or heavy crush hazard.",
            "Classified as Non-SIF."
        ],
        "sif": False,
        "risk_range": (0.10, 0.26),
        "priority": "LOW"
    }
]

def generate_dataset(num_records=750):
    reports = []
    base_date = datetime.now() - timedelta(days=120)

    # We want approx 24-28% SIF-Potential reports (very realistic for industrial oil & gas HSE data)
    num_sif = int(num_records * 0.26)
    num_non_sif = num_records - num_sif

    report_id_counter = 1

    # Generate SIF Reports
    for i in range(num_sif):
        pattern = random.choices(
            SIF_PATTERNS,
            weights=[p["weight"] for p in SIF_PATTERNS],
            k=1
        )[0]

        site_obj = next((s for s in SITES if s["name"] == pattern["site"]), random.choice(SITES))
        # Add some natural site variance while keeping primary cluster strong
        if random.random() < 0.25:
            site_obj = random.choice(SITES)

        dept = random.choice(DEPARTMENTS)
        reporter_name, reporter_role = random.choice(REPORTERS)
        days_offset = random.randint(0, 120)
        report_date = base_date + timedelta(days=days_offset, hours=random.randint(6, 18), minutes=random.randint(0, 59))

        report_type = random.choices(
            ["Near-Miss", "Unsafe Condition", "Unsafe Act", "Incident"],
            weights=[50, 25, 20, 5],
            k=1
        )[0]

        risk_score = round(random.uniform(0.72, 0.98), 2)
        priority = "HIGH" if risk_score >= 0.70 else "MEDIUM"

        description = pattern["template"].format(
            equip=pattern["equipment"],
            loc=pattern["location"]
        )

        title = f"{pattern['activity']}: {pattern['barrier_failure']} ({pattern['equipment']})"

        report = {
            "id": f"OIL-REP-{report_date.year}-{report_id_counter:04d}",
            "report_id": f"OIL-REP-{report_date.year}-{report_id_counter:04d}",
            "title": title,
            "description": description,
            "report_type": report_type,
            "date": report_date.isoformat(),
            "site": site_obj["name"],
            "site_code": site_obj["code"],
            "department": dept,
            "submitted_by": f"{reporter_name} ({reporter_role})",
            "sif_potential": True,
            "probability": round(random.uniform(0.85, 0.98), 3),
            "risk_score": risk_score,
            "risk_level": "HIGH",
            "priority": priority,
            "life_saving_rule": pattern["life_saving_rule"],
            "pattern_cluster": pattern["pattern_name"],
            "precursors": {
                "activity": pattern["activity"],
                "location": pattern["location"],
                "equipment": pattern["equipment"],
                "hazard": pattern["hazard"],
                "barrier_failure": pattern["barrier_failure"],
                "unsafe_act": pattern["unsafe_act"],
                "unsafe_condition": pattern["unsafe_condition"],
                "potential_consequence": pattern["potential_consequence"],
                "life_saving_rule": pattern["life_saving_rule"]
            },
            "explanation": pattern["explanation"],
            "status": random.choice(["Detected", "Under Review", "Action Assigned", "Corrective Action", "Resolved"]),
            "reviewed_by_human": random.choice([True, False]),
            "human_override": False,
            "synthetic_watermark": "SYNTHETIC_DATASET_SIH_DEMO_NOT_ACTUAL_OIL_DATA"
        }
        reports.append(report)
        report_id_counter += 1

    # Generate Non-SIF Reports
    for i in range(num_non_sif):
        scenario = random.choice(NON_SIF_SCENARIOS)
        site_obj = random.choice(SITES)
        dept = random.choice(DEPARTMENTS)
        reporter_name, reporter_role = random.choice(REPORTERS)
        days_offset = random.randint(0, 120)
        report_date = base_date + timedelta(days=days_offset, hours=random.randint(6, 18), minutes=random.randint(0, 59))

        report_type = random.choices(
            ["Unsafe Condition", "Unsafe Act", "Near-Miss"],
            weights=[45, 40, 15],
            k=1
        )[0]

        risk_score = round(random.uniform(scenario["risk_range"][0], scenario["risk_range"][1]), 2)
        risk_level = "LOW" if risk_score < 0.40 else "MEDIUM"
        probability = round(random.uniform(0.04, 0.32), 3)

        location_sample = f"Facility Sector {random.randint(1, 8)}, Bay {chr(random.randint(65, 70))}"
        description = scenario["template"].format(
            loc=location_sample
        )

        title = f"{scenario['activity']} - {scenario['hazard']} ({location_sample})"

        report = {
            "id": f"OIL-REP-{report_date.year}-{report_id_counter:04d}",
            "report_id": f"OIL-REP-{report_date.year}-{report_id_counter:04d}",
            "title": title,
            "description": description,
            "report_type": report_type,
            "date": report_date.isoformat(),
            "site": site_obj["name"],
            "site_code": site_obj["code"],
            "department": dept,
            "submitted_by": f"{reporter_name} ({reporter_role})",
            "sif_potential": False,
            "probability": probability,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "priority": scenario["priority"],
            "life_saving_rule": scenario["life_saving_rule"],
            "pattern_cluster": "Non-Systemic / Low-Severity Routine",
            "precursors": {
                "activity": scenario["activity"],
                "location": location_sample,
                "equipment": scenario["equipment"],
                "hazard": scenario["hazard"],
                "barrier_failure": scenario["barrier_failure"],
                "unsafe_act": scenario["unsafe_act"],
                "unsafe_condition": scenario["unsafe_condition"],
                "potential_consequence": scenario["potential_consequence"],
                "life_saving_rule": scenario["life_saving_rule"]
            },
            "explanation": scenario["explanation"],
            "status": random.choice(["Resolved", "Under Review", "Action Assigned"]),
            "reviewed_by_human": random.choice([True, False]),
            "human_override": False,
            "synthetic_watermark": "SYNTHETIC_DATASET_SIH_DEMO_NOT_ACTUAL_OIL_DATA"
        }
        reports.append(report)
        report_id_counter += 1

    # Shuffle to mix SIF and Non-SIF
    random.shuffle(reports)

    # Sort descending by date so recent reports appear at the top
    reports.sort(key=lambda r: r["date"], reverse=True)

    output_path = Path(__file__).parent / "synthetic_reports.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2)

    print(f"Generated {len(reports)} synthetic reports ({num_sif} SIF-Potential, {num_non_sif} Non-SIF) to {output_path}")

if __name__ == "__main__":
    generate_dataset(750)
