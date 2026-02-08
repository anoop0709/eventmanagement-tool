import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error with details
  logger.error('Error Handler', {
    requestId: req.id,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
    statusCode,
  });

  // Send appropriate response based on environment
  const response = {
    message: err.message || 'Internal Server Error',
    requestId: req.id,
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    response.message = 'Internal Server Error';
  }

  res.status(statusCode).json(response);
};

// Not found handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
