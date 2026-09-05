import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateCartTotals } from '../utils/totals.js';
import { getActiveSalesByProductIds, salePrice } from '../utils/salePricing.js';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function assertPurchasable(product) {
  if (product.stockStatus === 'coming_soon') throw ApiError.badRequest('This product is coming soon and cannot be ordered yet');
  if (!(product.variants || []).some((variant) => variant.stock > 0)) throw ApiError.badRequest('This product is currently out of stock');
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ success: true, cart, totals: await calculateCartTotals(cart) });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, sku, qty = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');
  assertPurchasable(product);

  if (!sku) throw ApiError.badRequest('Please select a design before adding this product to your bag');
  const variant = product.variants.find((v) => v.sku === sku);
  if (!variant) throw ApiError.badRequest('The selected design is no longer available');
  if (variant.isActive === false) throw ApiError.badRequest('This design is currently unavailable');
  const requestedQty = Number(qty);
  if (!Number.isInteger(requestedQty) || requestedQty < 1) throw ApiError.badRequest('Quantity must be at least 1');
  if (variant.stock < requestedQty) throw ApiError.badRequest(`Only ${variant.stock} piece${variant.stock === 1 ? '' : 's'} of this design are available.`);

  const cart = await getOrCreateCart(req.user._id);
  const activeSales = await getActiveSalesByProductIds([product._id]);
  const price = salePrice(variant.price, activeSales.get(product._id.toString()));
  const existing = cart.items.find((i) => i.product.toString() === product._id.toString() && i.sku === variant.sku);

  if (existing) {
    if (existing.qty + requestedQty > variant.stock) throw ApiError.badRequest(`Only ${variant.stock} piece${variant.stock === 1 ? '' : 's'} of this design are available.`);
    existing.qty += requestedQty;
  } else {
    cart.items.push({
      product: product._id,
      sku: variant.sku,
      name: product.name,
      image: (variant.imagePublicId ? product.images.find((image) => image.publicId === variant.imagePublicId)?.url : null) || product.images[0]?.url || null,
      variantLabel: variant.label,
      price,
      qty: requestedQty,
    });
  }

  await cart.save();
  res.status(200).json({ success: true, cart, totals: await calculateCartTotals(cart) });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { sku } = req.params;
  const { qty } = req.body;
  if (qty < 1) throw ApiError.badRequest('Quantity must be at least 1');

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.sku === sku);
  if (!item) throw ApiError.notFound('Item not in cart');

  const product = await Product.findOne({ _id: item.product, isActive: true });
  if (!product) throw ApiError.badRequest(`${item.name} is no longer available`);
  assertPurchasable(product);
  const variant = product.variants.find((v) => v.sku === sku);
  if (!variant || variant.isActive === false || variant.stock < qty) throw ApiError.badRequest(`Not enough stock available for ${item.name}`);

  const activeSales = await getActiveSalesByProductIds([product._id]);
  item.price = salePrice(variant.price, activeSales.get(product._id.toString()));
  item.qty = Number(qty);
  await cart.save();
  res.status(200).json({ success: true, cart, totals: await calculateCartTotals(cart) });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.sku !== req.params.sku);
  await cart.save();
  res.status(200).json({ success: true, cart, totals: await calculateCartTotals(cart) });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = { code: null, type: null, value: null };
  await cart.save();
  res.status(200).json({ success: true, cart, totals: await calculateCartTotals(cart) });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon || !coupon.isValidNow()) throw ApiError.badRequest('This coupon is invalid or expired');

  const cart = await getOrCreateCart(req.user._id);
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (subtotal < coupon.minSubtotal) {
    throw ApiError.badRequest(`This coupon requires a minimum order of PKR ${coupon.minSubtotal}`);
  }

  cart.coupon = { code: coupon.code, type: coupon.type, value: coupon.value };
  await cart.save();
  res.status(200).json({ success: true, cart, totals: await calculateCartTotals(cart) });
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = { code: null, type: null, value: null };
  await cart.save();
  res.status(200).json({ success: true, cart, totals: await calculateCartTotals(cart) });
});
