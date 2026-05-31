const express = require('express');
const router = express.Router();

// In production, this data comes from PostgreSQL / data.gov.in API
// For the hackathon, we serve curated mock data based on real Telangana projects
const PROJECTS = [
  { id: 1,  name: 'Hyderabad Metro Phase 2',                sector: 'infrastructure', lat: 17.385,  lng: 78.4867, budget_cr: 14400, spent_cr: 8200,  status: 'ongoing',   completion: 57, state: 'Telangana', description: 'Extension of metro rail to 76 km additional network' },
  { id: 2,  name: 'AIIMS Hyderabad',                        sector: 'healthcare',     lat: 17.545,  lng: 78.571,  budget_cr: 2000,  spent_cr: 1800,  status: 'ongoing',   completion: 90, state: 'Telangana', description: 'New All India Institute of Medical Sciences campus' },
  { id: 3,  name: 'Outer Ring Road Extension',              sector: 'infrastructure', lat: 17.290,  lng: 78.560,  budget_cr: 3200,  spent_cr: 3200,  status: 'completed', completion: 100, state: 'Telangana', description: '158km ring road around Hyderabad' },
  { id: 4,  name: 'Jal Jeevan Mission – Nalgonda',          sector: 'rural_dev',      lat: 17.058,  lng: 79.267,  budget_cr: 850,   spent_cr: 430,   status: 'ongoing',   completion: 51, state: 'Telangana', description: 'Piped water to every household in Nalgonda district' },
  { id: 5,  name: 'IIIT Hyderabad Campus Expansion',        sector: 'education',      lat: 17.445,  lng: 78.349,  budget_cr: 500,   spent_cr: 280,   status: 'ongoing',   completion: 56, state: 'Telangana', description: 'New research blocks and student housing' },
  { id: 6,  name: 'Rajiv Aarogyasri Centres',              sector: 'healthcare',     lat: 17.680,  lng: 78.213,  budget_cr: 320,   spent_cr: 310,   status: 'completed', completion: 97, state: 'Telangana', description: 'Primary health centres under Aarogyasri scheme' },
  { id: 7,  name: 'PM Awas Yojana – Warangal',             sector: 'social_welfare', lat: 17.977,  lng: 79.598,  budget_cr: 1200,  spent_cr: 640,   status: 'stalled',   completion: 53, state: 'Telangana', description: 'Affordable housing for urban poor' },
  { id: 8,  name: 'NH-44 Widening – Hyderabad to Nagpur',  sector: 'infrastructure', lat: 17.100,  lng: 78.750,  budget_cr: 2800,  spent_cr: 1400,  status: 'ongoing',   completion: 50, state: 'Telangana', description: 'Four-laning of national highway 44' },
  { id: 9,  name: 'Kurnool Solar Power Plant',             sector: 'infrastructure', lat: 15.828,  lng: 78.037,  budget_cr: 900,   spent_cr: 1100,  status: 'completed', completion: 100, state: 'Andhra Pradesh', description: '900 MW ultra mega solar power plant' },
  { id: 10, name: 'PM POSHAN Mid-Day Meal – Telangana',    sector: 'education',      lat: 17.720,  lng: 79.012,  budget_cr: 280,   spent_cr: 270,   status: 'ongoing',   completion: 96, state: 'Telangana', description: 'Nutritional meals for 32 lakh school children' },
];

// GET /api/projects
router.get('/', (req, res) => {
  let { sector, status, state } = req.query;
  let result = [...PROJECTS];
  if (sector) result = result.filter(p => p.sector === sector);
  if (status) result = result.filter(p => p.status === status);
  if (state)  result = result.filter(p => p.state.toLowerCase() === state.toLowerCase());
  res.json({ count: result.length, projects: result });
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const project = PROJECTS.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

module.exports = router;
