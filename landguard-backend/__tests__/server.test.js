// Mock mongoose to prevent real DB connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue({ connection: { host: 'mock-host' } }),
    connection: {
      ...actualMongoose.connection,
      db: {
        collection: jest.fn().mockReturnValue({
          createIndex: jest.fn().mockResolvedValue(true),
        }),
      },
      close: jest.fn((force, cb) => {
        if (typeof force === 'function') { force(); return Promise.resolve(); }
        if (typeof cb === 'function') cb();
        return Promise.resolve();
      }),
    },
  };
});

// Mock socket.io Server to avoid real socket setup
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    use: jest.fn(),
    on: jest.fn(),
  })),
}));

// Mock socketService
jest.mock('../src/services/socketService', () => ({
  initSocket: jest.fn(),
}));

const request = require('supertest');
const { app, server } = require('../src/server');

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('GET /health', () => {
  it('should return 200 status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  it('should have status: OK in response body', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('OK');
  });

  it('should have environment field in response body', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('environment');
  });
});

describe('GET /api', () => {
  it('should return 200 status', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
  });

  it('should have message field containing LANDGUARD', async () => {
    const res = await request(app).get('/api');
    expect(res.body.message).toContain('LANDGUARD');
  });

  it('should have endpoints object', async () => {
    const res = await request(app).get('/api');
    expect(res.body).toHaveProperty('endpoints');
    expect(typeof res.body.endpoints).toBe('object');
  });
});

describe('GET /nonexistent-route', () => {
  it('should return 404 status', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.statusCode).toBe(404);
  });
});

describe('CORS headers', () => {
  it('should include Access-Control-Allow-Origin for localhost:3000', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3000');
    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });
});
