"""
Anomaly Detector Agent
======================
Identifies suspicious patterns in government spending using:
  - Isolation Forest (statistical outlier detection)
  - Rule-based flagging (stalled projects, vendor patterns)

Usage:
  python anomaly_detection.py
  python anomaly_detection.py --output json     # JSON output for API
  python anomaly_detection.py --input data.csv  # Custom dataset
"""

import argparse
import json
import sys
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from dotenv import load_dotenv

load_dotenv()

# ─── Mock dataset (replace with DB query in production) ───────────────────────
MOCK_DATA = pd.DataFrame([
    {"project_id": 1,  "name": "NH-44 Widening Pkg 3B",           "sector": "infrastructure", "budget": 2800, "spent": 2400, "completion": 18,  "months_active": 8,  "vendor_repeat_count": 2},
    {"project_id": 2,  "name": "PM Awas Yojana Warangal",         "sector": "social_welfare", "budget": 1200, "spent": 1100, "completion": 53,  "months_active": 28, "vendor_repeat_count": 1},
    {"project_id": 3,  "name": "Rural Health Sub-Centres Nizamabad","sector": "healthcare",    "budget": 340,  "spent": 310,  "completion": 91,  "months_active": 18, "vendor_repeat_count": 7},
    {"project_id": 4,  "name": "ICDS Centres Adilabad",            "sector": "social_welfare", "budget": 180,  "spent": 160,  "completion": 0,   "months_active": 12, "vendor_repeat_count": 0},
    {"project_id": 5,  "name": "Kurnool Solar Phase 2",            "sector": "infrastructure", "budget": 900,  "spent": 1100, "completion": 72,  "months_active": 20, "vendor_repeat_count": 1},
    {"project_id": 6,  "name": "District Hospital Khammam",        "sector": "healthcare",     "budget": 420,  "spent": 380,  "completion": 90,  "months_active": 22, "vendor_repeat_count": 1},
    {"project_id": 7,  "name": "PMGSY Roads Nalgonda",             "sector": "rural_dev",      "budget": 250,  "spent": 240,  "completion": 95,  "months_active": 14, "vendor_repeat_count": 1},
    {"project_id": 8,  "name": "Jal Jeevan Mission Nalgonda",      "sector": "rural_dev",      "budget": 850,  "spent": 430,  "completion": 51,  "months_active": 18, "vendor_repeat_count": 1},
    {"project_id": 9,  "name": "AIIMS Hyderabad",                  "sector": "healthcare",     "budget": 2000, "spent": 1800, "completion": 90,  "months_active": 30, "vendor_repeat_count": 2},
    {"project_id": 10, "name": "Hyderabad Metro Phase 2",          "sector": "infrastructure", "budget": 14400,"spent": 8200, "completion": 57,  "months_active": 24, "vendor_repeat_count": 1},
])


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create features for anomaly detection."""
    df = df.copy()
    # Spend ratio vs completion (>1 is overspend)
    df["spend_vs_completion"] = (df["spent"] / df["budget"]) / (df["completion"].clip(1) / 100)
    # Monthly burn rate
    df["monthly_burn"] = df["spent"] / df["months_active"].clip(1)
    # Cost per completion point
    df["cost_per_pct"] = df["spent"] / df["completion"].clip(1)
    # Progress rate (completion / months)
    df["progress_rate"] = df["completion"] / df["months_active"].clip(1)
    return df


def run_isolation_forest(df: pd.DataFrame) -> np.ndarray:
    """Run Isolation Forest and return anomaly scores (higher = more anomalous)."""
    feature_cols = ["spend_vs_completion", "monthly_burn", "cost_per_pct", "progress_rate"]
    X = df[feature_cols].fillna(0).values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = IsolationForest(
        n_estimators=100,
        contamination=0.25,   # Expect ~25% anomalous in public data
        random_state=42,
    )
    clf.fit(X_scaled)

    # decision_function: more negative = more anomalous
    raw_scores = clf.decision_function(X_scaled)
    # Normalise to [0, 1] where 1 = most anomalous
    normalised = 1 - (raw_scores - raw_scores.min()) / (raw_scores.max() - raw_scores.min() + 1e-9)
    return normalised


def apply_rule_engine(df: pd.DataFrame) -> list[dict]:
    """Apply domain-specific rules to classify flag type."""
    flags = []
    for _, row in df.iterrows():
        flag = None
        alert = None

        spend_ratio = row["spent"] / max(row["budget"], 1)
        completion = row["completion"]
        months = row["months_active"]
        vendor_count = row["vendor_repeat_count"]

        # Ghost project: no completion despite disbursement
        if spend_ratio > 0.7 and completion == 0:
            flag = "ghost_project"
            alert = f"₹{row['spent']} Cr disbursed but zero completion recorded. Possible ghost project."

        # Stalled: disbursed but stuck for a long time
        elif spend_ratio > 0.75 and completion < 60 and months > 20:
            flag = "stalled"
            alert = f"Over {months} months active with only {completion}% completion despite high disbursement."

        # Vendor anomaly: same vendor repeatedly
        elif vendor_count >= 5:
            flag = "vendor_anomaly"
            alert = f"Same contractor awarded {vendor_count} consecutive contracts — competitive bidding not detected."

        # Overspend: spent significantly more than budgeted
        elif spend_ratio > 1.15:
            flag = "overspend"
            overpct = round((spend_ratio - 1) * 100)
            alert = f"Spending is {overpct}% over original budget allocation."

        flags.append({"project_id": int(row["project_id"]), "flag": flag, "alert": alert})

    return flags


def load_data(input_file: str | None) -> pd.DataFrame:
    """Load data from CSV or use mock data."""
    if input_file and os.path.exists(input_file):
        return pd.read_csv(input_file)
    return MOCK_DATA


def main(output_format: str = "table", input_file: str | None = None):
    df = load_data(input_file)
    df = engineer_features(df)

    # Step 1: Isolation Forest scores
    if_scores = run_isolation_forest(df)

    # Step 2: Rule engine flags
    rule_flags = apply_rule_engine(df)
    rule_df = pd.DataFrame(rule_flags)

    # Step 3: Combine
    df["if_score"] = if_scores
    df = df.merge(rule_df, on="project_id")

    # Final risk score = blend of IF score + rule boost
    rule_boost = df["flag"].notna().astype(float) * 0.15
    df["risk_score"] = (df["if_score"] * 0.85 + rule_boost).clip(0, 1).round(3)

    # Filter results above threshold
    THRESHOLD = 0.35
    results = df[df["risk_score"] >= THRESHOLD].sort_values("risk_score", ascending=False)

    if output_format == "json":
        output = []
        for _, row in results.iterrows():
            output.append({
                "project_id": int(row["project_id"]),
                "project": row["name"],
                "sector": row["sector"],
                "risk_score": float(row["risk_score"]),
                "flag": row["flag"] if pd.notna(row["flag"]) else None,
                "alert": row["alert"] if pd.notna(row["alert"]) else None,
                "amount": float(row["budget"]),
                "spent": float(row["spent"]),
                "completion": int(row["completion"]),
            })
        print(json.dumps(output))
    else:
        print(f"\n{'='*80}")
        print("TAX TRANSPARENCY TRACKER — ANOMALY DETECTION REPORT")
        print(f"{'='*80}\n")
        print(f"{'Project':<40} {'Sector':<16} {'Risk':>6} {'Flag':<18} {'Score':>6}")
        print(f"{'-'*40} {'-'*16} {'-'*6} {'-'*18} {'-'*6}")
        for _, row in results.iterrows():
            flag_str = row["flag"] if pd.notna(row["flag"]) else "—"
            risk_icon = "🔴" if row["risk_score"] >= 0.65 else "🟡" if row["risk_score"] >= 0.4 else "🟢"
            print(f"{row['name']:<40} {row['sector']:<16} {risk_icon}     {flag_str:<18} {row['risk_score']:>.3f}")
        print(f"\n{'='*80}")
        print(f"Flagged: {len(results)} / {len(df)} projects  |  High-risk: {len(results[results['risk_score'] >= 0.65])}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tax Transparency — Anomaly Detector")
    parser.add_argument("--output", choices=["table", "json"], default="table")
    parser.add_argument("--input", type=str, default=None, help="Path to CSV dataset")
    args = parser.parse_args()
    main(args.output, args.input)
