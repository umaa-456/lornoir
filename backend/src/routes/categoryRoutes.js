import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:slug', categoryController.getCategory);

router.post('/', protect, restrictTo('admin'), categoryController.createCategory);
router.patch('/:id', protect, restrictTo('admin'), categoryController.updateCategory);
router.delete('/:id', protect, restrictTo('admin'), categoryController.deleteCategory);
router.post(
  '/:id/image',
  protect,
  restrictTo('admin'),
  upload.single('image'),
  categoryController.uploadCategoryImage
);

export default router;
