import { Router } from 'express';
import { body } from 'express-validator';
import * as productController from '../controllers/productController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/', productController.listProducts);
router.get('/stats', productController.getCatalogueStats);
router.get('/low-stock', protect, restrictTo('admin', 'employee'), productController.getLowStockProducts);
router.get('/:slug', productController.getProduct);
router.get('/:slug/related', productController.getRelatedProducts);

router.post(
  '/',
  protect,
  restrictTo('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('variants').isArray({ min: 1 }).withMessage('At least one variant is required'),
  ],
  validate,
  productController.createProduct
);

router.patch('/:id', protect, restrictTo('admin'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);
router.post(
  '/:id/images',
  protect,
  restrictTo('admin'),
  upload.array('images', 8),
  productController.uploadProductImages
);
router.delete('/:id/images/:publicId', protect, restrictTo('admin'), productController.deleteProductImage);

export default router;
