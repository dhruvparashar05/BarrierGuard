import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

class ReportSimilarityEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=2500
        )
        self.corpus_reports = []
        self.corpus_matrix = None

    def fit_corpus(self, reports: List[Dict[str, Any]]):
        self.corpus_reports = reports
        texts = [
            f"{r.get('title', '')} {r.get('description', '')} {r.get('life_saving_rule', '')} {r.get('precursors', {}).get('barrier_failure', '')}"
            for r in reports
        ]
        if texts:
            self.corpus_matrix = self.vectorizer.fit_transform(texts)

    def find_similar(self, query_text: str, current_id: str = None, top_k: int = 5) -> List[Dict[str, Any]]:
        if self.corpus_matrix is None or not self.corpus_reports:
            return []

        query_vec = self.vectorizer.transform([query_text])
        sims = cosine_similarity(query_vec, self.corpus_matrix)[0]

        ranked_indices = np.argsort(sims)[::-1]
        results = []

        for idx in ranked_indices:
            rep = self.corpus_reports[idx]
            rep_id = rep.get("id") or rep.get("report_id")
            if current_id and rep_id == current_id:
                continue

            score = float(sims[idx])
            if score < 0.15 and len(results) >= 2:
                break

            results.append({
                "id": rep_id,
                "report_id": rep_id,
                "title": rep.get("title", ""),
                "description": (rep.get("description", "")[:130] + "..."),
                "similarity_score": round(score, 3),
                "similarity_percentage": int(score * 100),
                "sif_potential": rep.get("sif_potential", False),
                "risk_level": rep.get("risk_level", "LOW"),
                "risk_score": rep.get("risk_score", 0.2),
                "site": rep.get("site", ""),
                "date": rep.get("date", ""),
                "life_saving_rule": rep.get("life_saving_rule", "")
            })

            if len(results) >= top_k:
                break

        return results

similarity_engine = ReportSimilarityEngine()
