import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();
router.use(protect);

router.get('/', notificationController.listNotifications);
router.patch('/:id/read', notificationController.markNotificationRead);
router.patch('/read-all', notificationController.markAllNotificationsRead);

export default router;
