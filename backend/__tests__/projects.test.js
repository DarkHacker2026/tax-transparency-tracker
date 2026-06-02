const request = require('supertest');
const app = require('../index');

describe('GET /api/projects', () => {
  test('filters projects by sector, status, and state', async () => {
    const res = await request(app)
      .get('/api/projects')
      .query({ sector: 'infrastructure', status: 'ongoing', state: 'Telangana' });

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.projects.every((p) => p.sector === 'infrastructure')).toBe(true);
    expect(res.body.projects.every((p) => p.status === 'ongoing')).toBe(true);
    expect(res.body.projects.every((p) => p.state === 'Telangana')).toBe(true);
  });

  test('returns one project by id', async () => {
    const res = await request(app).get('/api/projects/1');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Hyderabad Metro Phase 2');
  });

  test('returns 404 for unknown project id', async () => {
    const res = await request(app).get('/api/projects/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Project not found');
  });
});
