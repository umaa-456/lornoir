import { Router } from 'express';
import * as brandController from '../controllers/brandController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', brandController.listBrands);
router.get('/:slug', brandController.getBrand);

router.post('/', protect, restrictTo('admin'), brandController.createBrand);
router.patch('/:id', protect, restrictTo('admin'), brandController.updateBrand);
router.delete('/:id', protect, restrictTo('admin'), brandController.deleteBrand);
router.post('/:id/logo', protect, restrictTo('admin'), upload.single('logo'), brandController.uploadBrandLogo);

export default router;
