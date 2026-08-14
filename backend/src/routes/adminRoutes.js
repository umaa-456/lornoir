import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = Router();
router.use(protect, restrictTo('admin', 'employee'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/customers', adminController.listCustomers);
router.post('/customers/staff', restrictTo('admin'), adminController.createStaffMember);
router.patch('/customers/:id/role', restrictTo('admin'), adminController.updateUserRole);
router.patch('/customers/:id/toggle-active', restrictTo('admin'), adminController.toggleUserActive);
router.get('/reviews', adminController.listAllReviewsForModeration);
router.delete('/reviews/:id', adminController.deleteReviewAsAdmin);

export default router;
