const AuditLog = require('../models/AuditLog');

function audit(action) {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', async () => {
      try {
        await AuditLog.create({
          userId: req.user?.id,
          action,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: { durationMs: Date.now() - start }
        });
      } catch (error) {
        console.error('Audit log error:', error.message);
      }
    });

    next();
  };
}

module.exports = { audit };
