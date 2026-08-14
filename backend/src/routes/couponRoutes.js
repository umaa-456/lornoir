import { Router } from 'express';
import * as couponController from '../controllers/couponController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = Router();

router.get('/validate/:code', protect, couponController.validateCoupon);

router.get('/', protect, restrictTo('admin'), couponController.listCoupons);
router.post('/', protect, restrictTo('admin'), couponController.createCoupon);
router.patch('/:id', protect, restrictTo('admin'), couponController.updateCoupon);
router.delete('/:id', protect, restrictTo('admin'), couponController.deleteCoupon);

export default router;
