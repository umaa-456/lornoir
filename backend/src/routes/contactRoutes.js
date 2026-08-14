import { Router } from 'express';
import { body } from 'express-validator';
import { sendContactMessage } from '../controllers/contactController.js';
import validate from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post(
  '/',
  authLimiter, // Reuses the stricter limiter to deter contact-form spam/abuse
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  validate,
  sendContactMessage
);

export default router;
