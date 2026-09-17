import urllib.request
import json
import sys

def test_full_system():
    print("========================================")
    print("   BARRIERGUARD SYSTEM VERIFICATION   ")
    print("========================================")

    # 1. Test Backend Root
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("[PASS] Backend Root (200 OK):", data.get("app"), "-", data.get("tagline"))
    except Exception as e:
        print("[FAIL] Backend Root:", e)
        return False

    # 2. Test Dashboard Summary API
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/dashboard/summary")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] Dashboard Summary (200 OK): {data['total_reports']} Reports, {data['sif_potential_reports']} SIF-Potential ({data['sif_percentage']}%)")
    except Exception as e:
        print("[FAIL] Dashboard Summary:", e)
        return False

    # 3. Test Dashboard Trends API
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/dashboard/trends")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] Dashboard Trends (200 OK): {len(data['monthly_trend'])} Monthly buckets, {len(data['rules_distribution'])} Rules, {len(data['top_high_risk_sites'])} Sites ranked")
    except Exception as e:
        print("[FAIL] Dashboard Trends:", e)
        return False

    # 4. Test Reports List API with filters
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/reports?page=1&page_size=5&sif=true")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] Reports List (200 OK): {data['total']} total SIF reports, retrieved {len(data['items'])} items")
            first_rep = data['items'][0]
            print(f"       Sample: [{first_rep['report_id']}] {first_rep['title']} ({first_rep['site']}) - Risk: {first_rep['risk_score']}")
    except Exception as e:
        print("[FAIL] Reports List:", e)
        return False

    # 5. Test Live NLP Inference Sandbox
    try:
        payload = json.dumps({
            "description": "During pump maintenance at Site A, technician started work before confirming complete electrical isolation. 440V live terminal."
        }).encode('utf-8')
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/reports/analyze",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] Live NLP Analysis (200 OK):")
            print(f"       SIF Potential: {data['sif_potential']} | Risk Score: {data['risk_score']} ({data['risk_level']})")
            print(f"       IOGP Rule: {data['life_saving_rule']} | Precursor: {data['precursors']['barrier_failure']}")
            print(f"       XAI Explanation: {data['explanation'][0]}")
    except Exception as e:
        print("[FAIL] Live NLP Analysis:", e)
        return False

    # 6. Test Patterns Clustering API
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/patterns")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] Patterns Clustering (200 OK): {len(data)} recurring patterns detected")
            if data:
                top_pat = data[0]
                print(f"       Top Pattern: {top_pat['name']} at {top_pat['site']} ({top_pat['occurrences']} occurrences, {top_pat['sif_percentage']}% SIF)")
    except Exception as e:
        print("[FAIL] Patterns API:", e)
        return False

    # 7. Test IOGP Rules API
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/life-saving-rules")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] IOGP Rules (200 OK): {len(data)} standard rules mapped")
    except Exception as e:
        print("[FAIL] Rules API:", e)
        return False

    # 8. Test Alerts Feed API
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/alerts")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] Alerts Feed (200 OK): {len(data)} active alarms loaded")
    except Exception as e:
        print("[FAIL] Alerts API:", e)
        return False

    # 9. Test Interventions API
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/interventions")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[PASS] HSE Interventions (200 OK): {len(data)} active action plans")
    except Exception as e:
        print("[FAIL] Interventions API:", e)
        return False

    # 10. Test Vite Web Server (HTML & Assets)
    try:
        req = urllib.request.Request("http://localhost:5173/")
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')
            assert '<div id="root"></div>' in html
            print(f"[PASS] Web Dev Server (200 OK): Vite is serving index.html cleanly ({len(html)} bytes)")
    except Exception as e:
        print("[FAIL] Web Dev Server:", e)
        return False

    # 11. Test Vite Main Entrypoint JS bundle
    try:
        req = urllib.request.Request("http://localhost:5173/src/main.tsx")
        with urllib.request.urlopen(req) as resp:
            js = resp.read().decode('utf-8')
            print(f"[PASS] Web Main Entrypoint (200 OK): /src/main.tsx served ({len(js)} bytes)")
    except Exception as e:
        print("[FAIL] Web Main Entrypoint:", e)
        return False

    print("========================================")
    print("   ALL 11 CHECKS PASSED PERFECTLY!     ")
    print("========================================")
    return True

if __name__ == "__main__":
    success = test_full_system()
    sys.exit(0 if success else 1)
