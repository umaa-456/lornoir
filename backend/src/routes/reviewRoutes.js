import { Router } from 'express';
import { body } from 'express-validator';
import * as reviewController from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/featured', reviewController.getFeaturedReviews);
router.get('/product/:slug', reviewController.listProductReviews);

router.post(
  '/',
  protect,
  upload.array('images', 4),
  [
    body('productId').notEmpty().withMessage('Product is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  validate,
  reviewController.createReview
);

router.patch('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);
router.post('/:id/helpful', reviewController.markHelpful);

export default router;
