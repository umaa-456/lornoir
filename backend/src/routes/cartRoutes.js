import { Router } from 'express';
import { body } from 'express-validator';
import * as cartController from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';

const router = Router();
router.use(protect);

router.get('/', cartController.getCart);
router.post(
  '/items',
  [body('productId').notEmpty(), body('sku').notEmpty(), body('qty').optional().isInt({ min: 1 })],
  validate,
  cartController.addToCart
);
router.patch('/items/:sku', [body('qty').isInt({ min: 1 })], validate, cartController.updateCartItem);
router.delete('/items/:sku', cartController.removeCartItem);
router.delete('/', cartController.clearCart);
router.post('/coupon', [body('code').notEmpty()], validate, cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

export default router;
