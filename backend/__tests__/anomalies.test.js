const request = require('supertest');
const app = require('../index');

describe('GET /api/anomalies', () => {
  test('returns all anomaly records by default', async () => {
    const res = await request(app).get('/api/anomalies');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
  });

  test('filters anomalies by minimum score and flag', async () => {
    const res = await request(app)
      .get('/api/anomalies')
      .query({ min_score: 0.6, flag: 'overspend' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].flag).toBe('overspend');
    expect(res.body[0].risk_score).toBeGreaterThanOrEqual(0.6);
  });
});
