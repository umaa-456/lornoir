import { Router } from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/orderController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';

const router = Router();
router.use(protect);

router.post(
  '/',
  [
    body('shippingAddressId').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').isIn(['cod', 'stripe']).withMessage('Invalid payment method'),
  ],
  validate,
  orderController.createOrder
);
router.get('/mine', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// ---------- Admin ----------
router.get('/', restrictTo('admin', 'employee'), orderController.listAllOrders);
router.patch('/:id/status', restrictTo('admin', 'employee'), orderController.updateOrderStatus);
router.post('/:id/refund', restrictTo('admin'), orderController.refundOrder);

export default router;
