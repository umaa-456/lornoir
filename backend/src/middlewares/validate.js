import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/** Runs after express-validator chains; throws a formatted ApiError on failure. */
export default function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest(
      'Validation failed',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
}
