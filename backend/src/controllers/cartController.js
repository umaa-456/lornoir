import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function computeTotals(cart) {
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  let discount = 0;
  if (cart.coupon?.code) {
    discount =
      cart.coupon.type === 'percent'
        ? subtotal * (cart.coupon.value / 100)
        : Math.min(cart.coupon.value, subtotal);
  }
  const shipping = subtotal - discount > 150 || cart.items.length === 0 ? 0 : 12;
  const total = Math.max(0, subtotal - discount + shipping);
  return { subtotal, discount, shipping, total };
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ success: true, cart, totals: computeTotals(cart) });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, sku, qty = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');

  const variant = product.variants.find((v) => v.sku === sku) || product.variants[0];
  if (variant.stock < qty) throw ApiError.badRequest('Not enough stock available');

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.sku === variant.sku);

  if (existing) {
    existing.qty = Math.min(existing.qty + Number(qty), variant.stock);
  } else {
    cart.items.push({
      product: product._id,
      sku: variant.sku,
      name: product.name,
      image: product.images[0]?.url || null,
      variantLabel: variant.label,
      price: variant.price,
      qty: Math.min(Number(qty), variant.stock),
    });
  }

  await cart.save();
  res.status(200).json({ success: true, cart, totals: computeTotals(cart) });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { sku } = req.params;
  const { qty } = req.body;
  if (qty < 1) throw ApiError.badRequest('Quantity must be at least 1');

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.sku === sku);
  if (!item) throw ApiError.notFound('Item not in cart');

  item.qty = qty;
  await cart.save();
  res.status(200).json({ success: true, cart, totals: computeTotals(cart) });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.sku !== req.params.sku);
  await cart.save();
  res.status(200).json({ success: true, cart, totals: computeTotals(cart) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = { code: null, type: null, value: null };
  await cart.save();
  res.status(200).json({ success: true, cart, totals: computeTotals(cart) });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon || !coupon.isValidNow()) throw ApiError.badRequest('This coupon is invalid or expired');

  const cart = await getOrCreateCart(req.user._id);
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (subtotal < coupon.minSubtotal) {
    throw ApiError.badRequest(`This coupon requires a minimum order of $${coupon.minSubtotal}`);
  }

  cart.coupon = { code: coupon.code, type: coupon.type, value: coupon.value };
  await cart.save();
  res.status(200).json({ success: true, cart, totals: computeTotals(cart) });
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = { code: null, type: null, value: null };
  await cart.save();
  res.status(200).json({ success: true, cart, totals: computeTotals(cart) });
});
