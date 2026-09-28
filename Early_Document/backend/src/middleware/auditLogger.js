/**
 * Audit Logger Middleware
 * Automatically records all admin/driver state-changing actions
 * (POST, PUT, PATCH, DELETE) to the AuditLog table.
 */
const AuditLog = require('../models/AuditLog');

const auditLogger = (resourceType) => async (req, res, next) => {
  // Only log state-changing methods
  const loggableMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!loggableMethods.includes(req.method)) {
    return next();
  }

  const originalJson = res.json.bind(res);
  
  res.json = (body) => {
    const response = originalJson(body);

    // Asynchronously log without delaying client HTTP response (Issue #127)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          const user = req.user || {};
          const action = `${req.method}_${resourceType || req.path.replace(/\//g, '_').toUpperCase()}`.replace(/^_/, '');
          
          // Deep recursive redaction for sensitive fields in audit logs (Issue #160)
          const sanitizeAuditPayload = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(sanitizeAuditPayload);

            const sensitivePattern = /^(password|oldpassword|newpassword|otp|code|token|accesstoken|refreshtoken|authtoken|secret|key_secret|webhook_secret|cvv|pin|governmentid|pan|aadhaar|ssn)$/i;

            const result = {};
            for (const [key, val] of Object.entries(obj)) {
              if (sensitivePattern.test(key)) {
                result[key] = '[REDACTED]';
              } else if (typeof val === 'object' && val !== null) {
                result[key] = sanitizeAuditPayload(val);
              } else {
                result[key] = val;
              }
            }
            return result;
          };
          
          const sanitizedBody = sanitizeAuditPayload(req.body);

          await AuditLog.create({
            action,
            performedBy: user.id || user.email || 'ANONYMOUS',
            performedByRole: user.role || 'unknown',
            resourceType,
            resourceId: req.params.id || (body && body.id) || null,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
            metadata: {
              path: req.path,
              body: sanitizedBody
            }
          });
        } catch (err) {
          // Never let audit logging break or crash the process
          console.error('[AuditLog] Failed to log action:', err.message);
        }
      });
    }

    return response;
  };

  next();
};

module.exports = auditLogger;
