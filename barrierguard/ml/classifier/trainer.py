import json
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

def train_sif_classifier():
    data_path = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic_reports.json"
    if not data_path.exists():
        raise FileNotFoundError(f"Synthetic dataset not found at {data_path}")

    with open(data_path, "r", encoding="utf-8") as f:
        reports = json.load(f)

    texts = [f"{r['title']} {r['description']}" for r in reports]
    labels = [1 if r["sif_potential"] else 0 for r in reports]

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.20, random_state=42, stratify=labels
    )

    # High performance n-gram TF-IDF pipeline + regularized Logistic Regression
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=5000,
            sublinear_tf=True,
            strip_accents="unicode"
        )),
        ("classifier", LogisticRegression(
            C=2.5,
            class_weight="balanced",
            max_iter=1000,
            random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)

    # Evaluate
    preds = pipeline.predict(X_test)
    probs = pipeline.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, probs)
    print("=== SIF CLASSIFIER EVALUATION ===")
    print(classification_report(y_test, preds, target_names=["Non-SIF", "SIF-Potential"]))
    print(f"ROC-AUC Score: {auc:.4f}")

    # Save trained artifact
    model_dir = Path(__file__).resolve().parent
    model_dir.mkdir(parents=True, exist_ok=True)
    model_save_path = model_dir / "sif_model.joblib"
    joblib.dump(pipeline, model_save_path)
    print(f"Model successfully trained and saved to {model_save_path}")

if __name__ == "__main__":
    train_sif_classifier()
