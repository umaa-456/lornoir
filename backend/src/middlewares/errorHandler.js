import ApiError from '../utils/ApiError.js';

export default function errorHandler(err, req, res, next) {
  let error = err;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = ApiError.notFound(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = ApiError.conflict(`${field ? `${field} already in use` : 'Duplicate value'}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') error = ApiError.unauthorized('Invalid token');
  if (err.name === 'TokenExpiredError') error = ApiError.unauthorized('Token expired');

  // Cloudinary errors (image upload) — the SDK throws plain objects with
  // an http_code, not a proper Error subclass, so they'd otherwise fall
  // through to a generic 500 with no useful message.
  if (err.http_code && typeof err.message === 'string') {
    error = ApiError.internal(
      err.http_code === 401
        ? 'Image upload is not configured yet — add real Cloudinary credentials to the backend .env file.'
        : `Image upload failed: ${err.message}`
    );
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong on our end';

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
