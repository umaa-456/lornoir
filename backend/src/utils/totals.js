import Product from '../models/Product.js';
import ApiError from './ApiError.js';

/**
 * Calculates shipping from the current product configuration.
 * Quantity is intentionally part of the calculation: fee × quantity. The
 * optional strict mode is used by payment/order creation so an unconfigured
 * product can never be purchased with silently-free shipping.
 */
export async function calculateCartTotals(cart, currentProducts = null, { requireConfiguredShipping = false } = {}) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = cart.coupon?.code
    ? (cart.coupon.type === 'percent' ? subtotal * (cart.coupon.value / 100) : Math.min(cart.coupon.value, subtotal))
    : 0;

  const products = currentProducts || await Product.find({
    _id: { $in: cart.items.map((item) => item.product) },
    isActive: true,
  }).select('_id name shippingFee');
  const productById = new Map(products.map((product) => [product._id.toString(), product]));
  let shipping = 0;
  let shippingConfigured = true;

  for (const item of cart.items) {
    const product = productById.get(item.product.toString());
    const fee = product?.shippingFee;
    if (!product || fee === null || fee === undefined || !Number.isFinite(Number(fee)) || Number(fee) < 0) {
      shippingConfigured = false;
      if (requireConfiguredShipping) {
        throw ApiError.badRequest(`Shipping has not been configured for ${item.name}. Please contact the store.`);
      }
      continue;
    }
    shipping += Number(fee) * Number(item.qty);
  }

  return { subtotal, discount, shipping, shippingConfigured, total: Math.max(0, subtotal - discount + shipping) };
}
