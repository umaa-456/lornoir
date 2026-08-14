import { Router } from 'express';
import { body } from 'express-validator';
import * as wishlistController from '../controllers/wishlistController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';

const router = Router();
router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/', [body('productId').notEmpty()], validate, wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.post('/:productId/move-to-cart', wishlistController.moveToCart);

export default router;
