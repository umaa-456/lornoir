import { Router } from 'express';
import * as siteSettingsController from '../controllers/siteSettingsController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', siteSettingsController.getSiteSettings);

// Payment configuration is managed separately from branding/content, but
// remains part of the existing singleton settings architecture.
router.get('/payment', protect, restrictTo('admin'), siteSettingsController.getPaymentSettings);
router.patch('/payment', protect, restrictTo('admin'), siteSettingsController.updatePaymentSettings);

router.patch('/', protect, restrictTo('admin'), siteSettingsController.updateSiteSettings);
router.post('/logo', protect, restrictTo('admin'), upload.single('logo'), siteSettingsController.uploadSiteLogo);
router.delete('/logo', protect, restrictTo('admin'), siteSettingsController.removeSiteLogo);

export default router;
