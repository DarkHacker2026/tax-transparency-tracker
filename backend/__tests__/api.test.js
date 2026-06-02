const request = require('supertest');
const app = require('../index');

describe('API server', () => {
  test('returns health status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toEqual(expect.any(String));
  });

  test('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/missing');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});
