const request = require('supertest');
const app = require('../index');

describe('POST /api/calculate', () => {
  test('calculates tax and sector allocations for the new regime', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ income: 1000000, regime: 'new' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      income: 1000000,
      regime: 'new',
      tax: 52000,
      effectiveRate: '5.20',
      perMonth: 4333,
    });
    expect(res.body.sectors).toHaveLength(8);
    expect(res.body.sectors.find((s) => s.id === 'infrastructure').amount).toBe(10400);
  });

  test('applies new-regime rebate for income up to seven lakh', async () => {
    const res = await request(app)
      .post('/api/calculate')
      .send({ income: 700000, regime: 'new' });

    expect(res.status).toBe(200);
    expect(res.body.tax).toBe(0);
  });

  test('rejects invalid income and regime values', async () => {
    const invalidIncome = await request(app)
      .post('/api/calculate')
      .send({ income: -1 });
    const invalidRegime = await request(app)
      .post('/api/calculate')
      .send({ income: 1000000, regime: 'future' });

    expect(invalidIncome.status).toBe(400);
    expect(invalidIncome.body.error).toBe('Invalid income value');
    expect(invalidRegime.status).toBe(400);
    expect(invalidRegime.body.error).toBe('regime must be "new" or "old"');
  });
});
