import { Router } from 'express';
import { body } from 'express-validator';
import * as addressController from '../controllers/addressController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';

const router = Router();
router.use(protect);

const addressValidators = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('line1').notEmpty().withMessage('Address line 1 is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('postalCode').notEmpty().withMessage('Postal code is required'),
  body('country').notEmpty().withMessage('Country is required'),
];

router.get('/', addressController.listAddresses);
router.post('/', addressValidators, validate, addressController.createAddress);
router.patch('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;
