import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getStripe } from '../services/stripeService.js';

/** Creates a PaymentIntent sized to the caller's current cart total. */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty');

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  let discount = 0;
  if (cart.coupon?.code) {
    discount =
      cart.coupon.type === 'percent'
        ? subtotal * (cart.coupon.value / 100)
        : Math.min(cart.coupon.value, subtotal);
  }
  const shipping = subtotal - discount > 150 ? 0 : 12;
  const total = Math.max(0, subtotal - discount + shipping);

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(total * 100), // Stripe expects the smallest currency unit
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { userId: req.user._id.toString() },
  });

  res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret, amount: total });
});

/**
 * Stripe webhook — must be mounted with express.raw() BEFORE the global
 * express.json() parser so the signature can be verified against the
 * untouched request body. See app.js for the mounting order.
 */
export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      await Order.updateMany(
        { stripePaymentIntentId: intent.id, paymentStatus: { $ne: 'paid' } },
        { paymentStatus: 'paid' }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      await Order.updateMany({ stripePaymentIntentId: intent.id }, { paymentStatus: 'failed' });
      break;
    }
    default:
      break; // Unhandled event types are safely ignored.
  }

  res.status(200).json({ received: true });
});
