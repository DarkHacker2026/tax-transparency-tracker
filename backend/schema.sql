-- Tax Transparency Tracker — PostgreSQL Schema
-- Run: psql -d tax_tracker -f schema.sql

CREATE TABLE IF NOT EXISTS budget_allocations (
    id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    ministry VARCHAR(200) NOT NULL,
    scheme_name VARCHAR(300),
    sector VARCHAR(50) NOT NULL,
    allocated_crore NUMERIC(12,2) NOT NULL,
    revised_crore NUMERIC(12,2),
    actual_crore NUMERIC(12,2),
    source VARCHAR(100) DEFAULT 'Union Budget PDF',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    budget_crore NUMERIC(12,2),
    spent_crore NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'ongoing',
    completion_pct INTEGER DEFAULT 0,
    contractor_name VARCHAR(200),
    start_date DATE,
    expected_end DATE,
    data_source VARCHAR(100) DEFAULT 'data.gov.in',
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anomaly_flags (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    risk_score NUMERIC(4,3) NOT NULL,
    flag_type VARCHAR(50),
    alert_message TEXT,
    model_version VARCHAR(20) DEFAULT 'v1.0',
    flagged_at TIMESTAMP DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state);
CREATE INDEX IF NOT EXISTS idx_anomalies_risk ON anomaly_flags(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_budget_year_sector ON budget_allocations(fiscal_year, sector);

-- Views
CREATE OR REPLACE VIEW sector_totals AS
SELECT
    sector,
    SUM(allocated_crore) as total_allocated,
    SUM(actual_crore) as total_actual,
    COUNT(*) as scheme_count
FROM budget_allocations
GROUP BY sector;
