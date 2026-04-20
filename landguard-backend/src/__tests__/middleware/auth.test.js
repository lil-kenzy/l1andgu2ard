const { authenticate, authorize, requireVerifiedSeller } = require('../../middleware/auth');

// ── authorize ────────────────────────────────────────────────────────────────
describe('authorize()', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('returns 401 when req.user is missing', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when role is not in the allowed list', () => {
    const req = { user: { role: 'buyer' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('admin', 'staff')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when role is permitted', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('admin', 'staff')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ── requireVerifiedSeller ────────────────────────────────────────────────────
describe('requireVerifiedSeller()', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('returns 403 when user is not a seller', () => {
    const req = { user: { role: 'buyer', isVerifiedSeller: false } };
    const res = mockRes();
    const next = jest.fn();

    requireVerifiedSeller(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when seller is not verified', () => {
    const req = { user: { role: 'seller', isVerifiedSeller: false } };
    const res = mockRes();
    const next = jest.fn();

    requireVerifiedSeller(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() for a verified seller', () => {
    const req = { user: { role: 'seller', isVerifiedSeller: true } };
    const res = mockRes();
    const next = jest.fn();

    requireVerifiedSeller(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ── authenticate (unit – no DB) ──────────────────────────────────────────────
describe('authenticate() – missing / malformed token', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('returns 401 when Authorization header is absent', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header has no Bearer prefix', async () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});