const express = require('express');
const router = express.Router();

const SECTOR_ALLOCATIONS = [
  { id: 'infrastructure', name: 'Infrastructure',     percent: 20.0 },
  { id: 'defence',        name: 'Defence',            percent: 13.0 },
  { id: 'healthcare',     name: 'Healthcare',         percent: 5.5  },
  { id: 'education',      name: 'Education',          percent: 4.5  },
  { id: 'social_welfare', name: 'Social Welfare',     percent: 15.0 },
  { id: 'rural_dev',      name: 'Rural Development',  percent: 10.0 },
  { id: 'admin',          name: 'Administration',     percent: 22.0 },
  { id: 'others',         name: 'Others',             percent: 10.0 },
];

const NEW_REGIME = [
  { min: 0,       max: 300000,  rate: 0  },
  { min: 300000,  max: 700000,  rate: 5  },
  { min: 700000,  max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity,rate: 30 },
];

const OLD_REGIME = [
  { min: 0,       max: 250000,  rate: 0  },
  { min: 250000,  max: 500000,  rate: 5  },
  { min: 500000,  max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity,rate: 30 },
];

function computeTax(income, regime) {
  const slabs = regime === 'new' ? NEW_REGIME : OLD_REGIME;
  let tax = 0;
  for (const s of slabs) {
    if (income <= s.min) break;
    tax += (Math.min(income, s.max) - s.min) * (s.rate / 100);
  }
  tax *= 1.04; // cess
  if (regime === 'new' && income <= 700000) tax = 0;
  return Math.round(tax);
}

router.post('/', (req, res) => {
  const { income, regime = 'new' } = req.body;

  if (!income || isNaN(income) || income < 0 || income > 100_00_00_000) {
    return res.status(400).json({ error: 'Invalid income value' });
  }
  if (!['new', 'old'].includes(regime)) {
    return res.status(400).json({ error: 'regime must be "new" or "old"' });
  }

  const tax = computeTax(Number(income), regime);
  const sectors = SECTOR_ALLOCATIONS.map(s => ({
    ...s,
    amount: Math.round((s.percent / 100) * tax),
  }));

  res.json({
    income: Number(income),
    regime,
    tax,
    effectiveRate: income > 0 ? ((tax / income) * 100).toFixed(2) : '0.00',
    perMonth: Math.round(tax / 12),
    perDay: Math.round(tax / 365),
    sectors,
  });
});

module.exports = router;
