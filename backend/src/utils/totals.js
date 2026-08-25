import SiteSettings from '../models/SiteSettings.js';

export async function calculateCartTotals(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = cart.coupon?.code
    ? (cart.coupon.type === 'percent' ? subtotal * (cart.coupon.value / 100) : Math.min(cart.coupon.value, subtotal))
    : 0;
  const settings = await SiteSettings.getSingleton();
  const shipping = subtotal === 0 || settings.shipping?.freeShipping ? 0 : Number(settings.shipping?.fixedCharge || 0);
  return { subtotal, discount, shipping, total: Math.max(0, subtotal - discount + shipping) };
}
