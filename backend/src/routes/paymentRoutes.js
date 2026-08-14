import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { createPaymentIntent } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-intent', protect, createPaymentIntent);

export default router;
