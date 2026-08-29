import { Router } from 'express';
import { body } from 'express-validator';
import * as sales from '../controllers/saleController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
const router = Router();
router.get('/active', sales.getActiveSale);
router.get('/', protect, restrictTo('admin', 'employee'), sales.listSales);
const rules = [
  body('title').trim().notEmpty().withMessage('Sale title is required'),
  body('discount').isFloat({ min: 0.01, max: 100 }).withMessage('Discount must be between 0.01 and 100'),
  body('startsAt').isISO8601().withMessage('A valid start date is required'),
  body('endsAt').isISO8601().withMessage('A valid end date is required'),
  body('products').isArray({ min: 1 }).withMessage('Select at least one product'),
];
router.post('/', protect, restrictTo('admin'), rules, validate, sales.createSale);
router.patch('/:id', protect, restrictTo('admin'), rules.map((rule) => rule.optional()), validate, sales.updateSale);
router.delete('/:id', protect, restrictTo('admin'), sales.deleteSale);
export default router;
