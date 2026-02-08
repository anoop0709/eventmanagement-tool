import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

// Add request ID to all requests
export const requestId = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
};

// Log all requests
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?._id,
    };

    if (res.statusCode >= 500) {
      logger.error('Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client Error', logData);
    } else {
      logger.info('Request', logData);
    }
  });

  next();
};

// Log security events
export const logSecurityEvent = (event, details) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};
