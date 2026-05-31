import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnomalyAlerts.css';

const MOCK_ANOMALIES = [
  {
    id: 1, project: 'NH-44 Widening – Package 3B', sector: 'Infrastructure',
    risk_score: 0.82, flag: 'overspend', alert: 'Budget utilised is 340% above sector average for this stage of completion.',
    amount: 2800, spent: 2400, completion: 18, vendor: 'Infra Corp Ltd'
  },
  {
    id: 2, project: 'PM Awas Yojana – Warangal Zone 4', sector: 'Social Welfare',
    risk_score: 0.71, flag: 'stalled', alert: 'No progress reported in 14 months. Budget fully disbursed but completion at 53%.',
    amount: 1200, spent: 1100, completion: 53, vendor: 'BuildRight Pvt Ltd'
  },
  {
    id: 3, project: 'Rural Health Sub-Centres – Nizamabad', sector: 'Healthcare',
    risk_score: 0.68, flag: 'vendor_anomaly', alert: 'Same contractor awarded 7 consecutive tenders; no competitive bidding detected.',
    amount: 340, spent: 310, completion: 91, vendor: 'MedBuild Solutions'
  },
  {
    id: 4, project: 'Integrated Child Dev Scheme – Adilabad', sector: 'Social Welfare',
    risk_score: 0.55, flag: 'ghost_project', alert: 'Project listed in budget documents but no field activity or contractor records found.',
    amount: 180, spent: 160, completion: 0, vendor: 'Unknown'
  },
  {
    id: 5, project: 'Solar Power Plant – Kurnool Link', sector: 'Infrastructure',
    risk_score: 0.43, flag: 'overspend', alert: 'Minor cost overrun of 22% above baseline estimate. Under review.',
    amount: 900, spent: 1100, completion: 72, vendor: 'GreenWatt Energy'
  },
  {
    id: 6, project: 'District Hospital Upgrade – Khammam', sector: 'Healthcare',
    risk_score: 0.22, flag: null, alert: null,
    amount: 420, spent: 380, completion: 90, vendor: 'HealthBuild Ltd'
  },
];

const FLAG_LABELS = {
  overspend: '💸 Overspend',
  stalled: '⏸️ Stalled',
  vendor_anomaly: '🔄 Vendor Anomaly',
  ghost_project: '👻 Ghost Project',
};

function RiskBadge({ score }) {
  if (score >= 0.65) return <span className="badge badge-red">🔴 High Risk</span>;
  if (score >= 0.4) return <span className="badge badge-yellow">🟡 Watch</span>;
  return <span className="badge badge-green">🟢 Normal</span>;
}

export default function AnomalyAlerts() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    // Try to fetch from backend; fall back to mock data
    axios.get('https://tax-transparency-tracker.onrender.com/api/anomalies', { timeout: 3000 })
      .then(res => setAnomalies(res.data))
      .catch(() => setAnomalies(MOCK_ANOMALIES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = anomalies.filter(a => {
    if (filterLevel === 'high') return a.risk_score >= 0.65;
    if (filterLevel === 'watch') return a.risk_score >= 0.4 && a.risk_score < 0.65;
    if (filterLevel === 'normal') return a.risk_score < 0.4;
    return true;
  });

  return (
    <div className="alerts-wrap">
      <div className="alerts-header card">
        <div>
          <h2 className="section-title">Anomaly Alerts</h2>
          <p className="section-subtitle">
            AI & ML-flagged irregularities in public spending. For awareness and further investigation only — not legal evidence.
          </p>
        </div>
        <div className="alerts-filter">
          {['all', 'high', 'watch', 'normal'].map(f => (
            <button
              key={f}
              className={`filter-pill ${filterLevel === f ? 'active' : ''}`}
              onClick={() => setFilterLevel(f)}
            >
              {f === 'all' ? 'All' : f === 'high' ? '🔴 High' : f === 'watch' ? '🟡 Watch' : '🟢 Normal'}
            </button>
          ))}
        </div>
      </div>

      <div className="alerts-summary">
        <div className="summary-stat">
          <div className="sum-val">{anomalies.filter(a => a.risk_score >= 0.65).length}</div>
          <div className="sum-label">High Risk</div>
        </div>
        <div className="summary-stat">
          <div className="sum-val">{anomalies.filter(a => a.risk_score >= 0.4 && a.risk_score < 0.65).length}</div>
          <div className="sum-label">Watch</div>
        </div>
        <div className="summary-stat">
          <div className="sum-val">{anomalies.filter(a => a.risk_score < 0.4).length}</div>
          <div className="sum-label">Normal</div>
        </div>
        <div className="summary-stat">
          <div className="sum-val">
            ₹{(anomalies.filter(a => a.risk_score >= 0.65).reduce((s, a) => s + a.amount, 0) / 100).toFixed(1)}K Cr
          </div>
          <div className="sum-label">Flagged Budget</div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, marginBottom: 12 }} />
          ))}
        </div>
      ) : (
        <div className="alert-list">
          {filtered.map(a => (
            <div
              key={a.id}
              className={`alert-card card ${a.risk_score >= 0.65 ? 'risk-high' : a.risk_score >= 0.4 ? 'risk-watch' : 'risk-normal'}`}
            >
              <div className="alert-top">
                <div>
                  <div className="alert-project">{a.project}</div>
                  <div className="alert-sector">{a.sector}</div>
                </div>
                <div className="alert-badges">
                  <RiskBadge score={a.risk_score} />
                  {a.flag && <span className="badge" style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>{FLAG_LABELS[a.flag]}</span>}
                </div>
              </div>

              {a.alert && (
                <div className="alert-message">{a.alert}</div>
              )}

              <div className="alert-meta">
                <div className="alert-meta-item">
                  <span className="meta-label">Budget</span>
                  <span className="meta-val">₹{a.amount} Cr</span>
                </div>
                <div className="alert-meta-item">
                  <span className="meta-label">Spent</span>
                  <span className="meta-val">₹{a.spent} Cr</span>
                </div>
                <div className="alert-meta-item">
                  <span className="meta-label">Completion</span>
                  <span className="meta-val">{a.completion}%</span>
                </div>
                <div className="alert-meta-item">
                  <span className="meta-label">Risk Score</span>
                  <span className="meta-val" style={{ color: a.risk_score >= 0.65 ? 'var(--red)' : a.risk_score >= 0.4 ? 'var(--yellow)' : 'var(--green)' }}>
                    {a.risk_score.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="risk-bar-wrap">
                <div
                  className="risk-bar"
                  style={{
                    width: `${a.risk_score * 100}%`,
                    background: a.risk_score >= 0.65 ? 'var(--red)' : a.risk_score >= 0.4 ? 'var(--yellow)' : 'var(--green)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}