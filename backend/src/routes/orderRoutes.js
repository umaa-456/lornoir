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
    body('paymentMethod').isIn(['cod', 'jazzcash', 'easypaisa']).withMessage('Invalid payment method'),
    body('transactionId').if((value, { req }) => ['jazzcash', 'easypaisa'].includes(req.body.paymentMethod)).trim().notEmpty().withMessage('Transaction ID / payment reference is required').isLength({ max: 150 }).withMessage('Transaction ID / payment reference is too long'),
    body('checkoutRating').isInt({ min: 1, max: 5 }).withMessage('A rating from 1 to 5 is required'),
    body('subscribe').isBoolean().withMessage('Subscription choice is required'),
  ],
  validate,
  orderController.createOrder
);
router.get('/mine', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// ---------- Admin ----------
router.get('/', restrictTo('admin', 'employee'), orderController.listAllOrders);
router.patch(
  '/:id/status',
  restrictTo('admin', 'employee'),
  [
    body('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid order status'),
    body('trackingNumber').optional().trim().isLength({ max: 120 }).withMessage('Tracking number is too long'),
    body('note').optional().trim().isLength({ max: 500 }).withMessage('Status note is too long'),
  ],
  validate,
  orderController.updateOrderStatus
);
router.patch(
  '/:id/payment',
  restrictTo('admin', 'employee'),
  [body('paymentStatus').isIn(['pending', 'submitted', 'verified', 'rejected']).withMessage('Invalid payment status')],
  validate,
  orderController.updatePaymentStatus
);
router.post('/:id/refund', restrictTo('admin'), orderController.refundOrder);
router.delete('/:id', restrictTo('admin'), orderController.deleteCancelledOrder);

export default router;
