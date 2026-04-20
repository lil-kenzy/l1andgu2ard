const request = require('supertest');
const express = require('express');
const { notFound, errorHandler } = require('../../src/middleware/error');

describe('notFound middleware', () => {
  it('should return 404 with a message field for undefined routes', async () => {
    const app = express();
    app.use(notFound);
    app.use(errorHandler);

    const res = await request(app).get('/undefined-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});

describe('errorHandler middleware', () => {
  it('should return 500 when next is called with an error', async () => {
    const app = express();
    app.get('/error', (req, res, next) => {
      next(new Error('Test error'));
    });
    app.use(errorHandler);

    const res = await request(app).get('/error');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message');
  });

  it('should use error statusCode if set', async () => {
    const app = express();
    app.get('/error', (req, res, next) => {
      const err = new Error('Not found error');
      err.statusCode = 404;
      next(err);
    });
    app.use(errorHandler);

    const res = await request(app).get('/error');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});
