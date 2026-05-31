import React, { useState } from 'react';
import { calculateTax } from '../utils/taxConstants';
import './TaxCalculator.css';

export default function TaxCalculator({ onResult }) {
  const [income, setIncome] = useState('');
  const [regime, setRegime] = useState('new');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleCalculate = () => {
    const num = parseFloat(income.replace(/,/g, ''));
    if (!num || num <= 0) return;
    setLoading(true);
    setTimeout(() => {
      const tax = calculateTax(num, regime);
      const res = {
        income: num,
        tax,
        regime,
        effectiveRate: num > 0 ? ((tax / num) * 100).toFixed(1) : 0,
        perDay: Math.round(tax / 365),
        perMonth: Math.round(tax / 12),
      };
      setResult(res);
      onResult(res);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="card calc-card">
      <div className="calc-header">
        <h2 className="section-title">Your Tax Calculator</h2>
        <p className="section-subtitle">Enter your annual income to see exactly how your taxes are allocated.</p>
      </div>

      <div className="calc-form">
        <div className="input-group">
          <label className="input-label">Annual Income</label>
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              type="number"
              className="income-input"
              placeholder="e.g. 800000"
              value={income}
              onChange={e => setIncome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCalculate()}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Tax Regime</label>
          <div className="regime-toggle">
            <button
              className={`regime-btn ${regime === 'new' ? 'active' : ''}`}
              onClick={() => setRegime('new')}
            >
              New Regime (2024–25)
            </button>
            <button
              className={`regime-btn ${regime === 'old' ? 'active' : ''}`}
              onClick={() => setRegime('old')}
            >
              Old Regime
            </button>
          </div>
        </div>

        <button
          className={`calc-btn ${loading ? 'loading' : ''}`}
          onClick={handleCalculate}
          disabled={loading || !income}
        >
          {loading ? <span className="spinner"></span> : 'Calculate →'}
        </button>
      </div>

      {result && (
        <div className="calc-result fade-up">
          <div className="divider" />
          <div className="result-grid">
            <div className="result-item accent">
              <div className="result-value">{formatINR(result.tax)}</div>
              <div className="result-label">Total Tax Paid</div>
            </div>
            <div className="result-item">
              <div className="result-value">{result.effectiveRate}%</div>
              <div className="result-label">Effective Tax Rate</div>
            </div>
            <div className="result-item">
              <div className="result-value">{formatINR(result.perMonth)}</div>
              <div className="result-label">Per Month</div>
            </div>
            <div className="result-item">
              <div className="result-value">{formatINR(result.perDay)}</div>
              <div className="result-label">Per Day</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
