// Union Budget 2024-25 allocation percentages (approximate)
export const SECTOR_ALLOCATIONS = [
  { id: 'infrastructure', name: 'Infrastructure', percent: 20.0, icon: '🏗️', color: '#4a9eff', description: 'Roads, highways, bridges, metro, railways' },
  { id: 'defence',        name: 'Defence',        percent: 13.0, icon: '🛡️', color: '#ff6b35', description: 'Armed forces, border security, R&D' },
  { id: 'healthcare',     name: 'Healthcare',     percent: 5.5,  icon: '🏥', color: '#00e5a0', description: 'Govt hospitals, Ayushman Bharat, AIIMS' },
  { id: 'education',      name: 'Education',      percent: 4.5,  icon: '📚', color: '#a78bfa', description: 'Schools, IITs, IIMs, scholarships' },
  { id: 'social_welfare', name: 'Social Welfare',  percent: 15.0, icon: '🌾', color: '#fbbf24', description: 'PM Kisan, MGNREGA, subsidies' },
  { id: 'rural_dev',      name: 'Rural Development', percent: 10.0, icon: '🏡', color: '#34d399', description: 'Villages, sanitation, Jal Jeevan Mission' },
  { id: 'admin',          name: 'Administration', percent: 22.0, icon: '⚖️', color: '#f87171', description: 'Govt salaries, judiciary, debt servicing' },
  { id: 'others',         name: 'Others',         percent: 10.0, icon: '🚀', color: '#60a5fa', description: 'Space, environment, sports, culture' },
];

// Tax slabs - New Regime 2024-25
export const NEW_REGIME_SLABS = [
  { min: 0,       max: 300000,  rate: 0 },
  { min: 300000,  max: 700000,  rate: 5 },
  { min: 700000,  max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity,rate: 30 },
];

// Tax slabs - Old Regime
export const OLD_REGIME_SLABS = [
  { min: 0,       max: 250000,  rate: 0 },
  { min: 250000,  max: 500000,  rate: 5 },
  { min: 500000,  max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity,rate: 30 },
];

export function calculateTax(income, regime) {
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const taxable = Math.min(income, slab.max) - slab.min;
    tax += taxable * (slab.rate / 100);
  }
  // 4% health & education cess
  tax = tax * 1.04;
  // Rebate u/s 87A for new regime (income <= 7L)
  if (regime === 'new' && income <= 700000) tax = 0;
  return Math.round(tax);
}

export function getSectorBreakdown(totalTax) {
  return SECTOR_ALLOCATIONS.map(s => ({
    ...s,
    amount: Math.round((s.percent / 100) * totalTax),
  }));
}
