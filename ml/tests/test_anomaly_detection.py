import pandas as pd

from anomaly_detection import apply_rule_engine, engineer_features, run_isolation_forest


def test_engineer_features_adds_expected_columns():
    df = pd.DataFrame([
        {
            "project_id": 1,
            "budget": 100,
            "spent": 50,
            "completion": 25,
            "months_active": 10,
            "vendor_repeat_count": 1,
        }
    ])

    result = engineer_features(df)

    assert result.loc[0, "spend_vs_completion"] == 2
    assert result.loc[0, "monthly_burn"] == 5
    assert result.loc[0, "cost_per_pct"] == 2
    assert result.loc[0, "progress_rate"] == 2.5


def test_rule_engine_flags_domain_anomalies():
    df = pd.DataFrame([
        {"project_id": 1, "budget": 100, "spent": 80, "completion": 0, "months_active": 12, "vendor_repeat_count": 0},
        {"project_id": 2, "budget": 100, "spent": 80, "completion": 50, "months_active": 24, "vendor_repeat_count": 0},
        {"project_id": 3, "budget": 100, "spent": 70, "completion": 90, "months_active": 12, "vendor_repeat_count": 5},
        {"project_id": 4, "budget": 100, "spent": 120, "completion": 90, "months_active": 12, "vendor_repeat_count": 0},
    ])

    flags = {item["project_id"]: item["flag"] for item in apply_rule_engine(df)}

    assert flags == {
        1: "ghost_project",
        2: "stalled",
        3: "vendor_anomaly",
        4: "overspend",
    }


def test_isolation_forest_returns_normalised_scores():
    df = engineer_features(pd.DataFrame([
        {"project_id": 1, "budget": 100, "spent": 90, "completion": 90, "months_active": 10, "vendor_repeat_count": 1},
        {"project_id": 2, "budget": 100, "spent": 95, "completion": 95, "months_active": 10, "vendor_repeat_count": 1},
        {"project_id": 3, "budget": 100, "spent": 10, "completion": 5, "months_active": 1, "vendor_repeat_count": 1},
        {"project_id": 4, "budget": 100, "spent": 20, "completion": 10, "months_active": 2, "vendor_repeat_count": 1},
        {"project_id": 5, "budget": 100, "spent": 150, "completion": 20, "months_active": 24, "vendor_repeat_count": 1},
    ]))

    scores = run_isolation_forest(df)

    assert len(scores) == 5
    assert all(0 <= score <= 1 for score in scores)
