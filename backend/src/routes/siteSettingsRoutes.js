import { Router } from 'express';
import * as siteSettingsController from '../controllers/siteSettingsController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', siteSettingsController.getSiteSettings);

router.patch('/', protect, restrictTo('admin'), siteSettingsController.updateSiteSettings);
router.post('/logo', protect, restrictTo('admin'), upload.single('logo'), siteSettingsController.uploadSiteLogo);
router.delete('/logo', protect, restrictTo('admin'), siteSettingsController.removeSiteLogo);

export default router;
