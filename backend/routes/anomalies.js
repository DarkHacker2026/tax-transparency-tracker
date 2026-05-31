const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');

// Mock anomaly data (in production, this is populated by the ML pipeline)
const ANOMALY_DATA = [
  {
    id: 1, project: 'NH-44 Widening – Package 3B', sector: 'Infrastructure',
    risk_score: 0.82, flag: 'overspend',
    alert: 'Budget utilised is 340% above sector average for this stage of completion.',
    amount: 2800, spent: 2400, completion: 18, vendor: 'Infra Corp Ltd',
    flagged_date: '2024-10-12',
  },
  {
    id: 2, project: 'PM Awas Yojana – Warangal Zone 4', sector: 'Social Welfare',
    risk_score: 0.71, flag: 'stalled',
    alert: 'No progress reported in 14 months. Budget fully disbursed but completion at 53%.',
    amount: 1200, spent: 1100, completion: 53, vendor: 'BuildRight Pvt Ltd',
    flagged_date: '2024-09-04',
  },
  {
    id: 3, project: 'Rural Health Sub-Centres – Nizamabad', sector: 'Healthcare',
    risk_score: 0.68, flag: 'vendor_anomaly',
    alert: 'Same contractor awarded 7 consecutive tenders; no competitive bidding detected.',
    amount: 340, spent: 310, completion: 91, vendor: 'MedBuild Solutions',
    flagged_date: '2024-11-01',
  },
  {
    id: 4, project: 'ICDS Centres – Adilabad', sector: 'Social Welfare',
    risk_score: 0.55, flag: 'ghost_project',
    alert: 'Project listed in budget documents but no field activity or contractor records found.',
    amount: 180, spent: 160, completion: 0, vendor: 'Unknown',
    flagged_date: '2024-10-28',
  },
  {
    id: 5, project: 'Kurnool Solar Power Plant – Phase 2', sector: 'Infrastructure',
    risk_score: 0.43, flag: 'overspend',
    alert: 'Minor cost overrun of 22% above baseline estimate. Under departmental review.',
    amount: 900, spent: 1100, completion: 72, vendor: 'GreenWatt Energy',
    flagged_date: '2024-08-17',
  },
  {
    id: 6, project: 'District Hospital Upgrade – Khammam', sector: 'Healthcare',
    risk_score: 0.22, flag: null,
    alert: null,
    amount: 420, spent: 380, completion: 90, vendor: 'HealthBuild Ltd',
    flagged_date: null,
  },
];

// GET /api/anomalies
router.get('/', (req, res) => {
  const { min_score, flag } = req.query;
  let result = [...ANOMALY_DATA];
  if (min_score) result = result.filter(a => a.risk_score >= parseFloat(min_score));
  if (flag) result = result.filter(a => a.flag === flag);
  res.json(result);
});

// POST /api/anomalies/run — triggers the ML pipeline (admin use)
router.post('/run', (req, res) => {
  const mlScript = path.join(__dirname, '../../ml/anomaly_detection.py');
  execFile('python3', [mlScript, '--output', 'json'], { timeout: 60000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('ML pipeline error:', stderr);
      return res.status(500).json({ error: 'ML pipeline failed', detail: stderr });
    }
    try {
      const results = JSON.parse(stdout);
      res.json({ success: true, flagged: results.length, results });
    } catch {
      res.status(500).json({ error: 'Failed to parse ML output' });
    }
  });
});

module.exports = router;
