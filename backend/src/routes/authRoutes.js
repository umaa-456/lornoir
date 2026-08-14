import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);
router.post('/me/avatar', protect, upload.single('avatar'), authController.uploadAvatar);

router.patch(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  authController.changePassword
);

router.get('/verify-email/:token', authController.verifyEmail);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Enter a valid email').normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.patch(
  '/reset-password/:token',
  authLimiter,
  [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')],
  validate,
  authController.resetPassword
);

export default router;
