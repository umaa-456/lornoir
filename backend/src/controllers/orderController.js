import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Address from '../models/Address.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendOrderConfirmationEmail } from '../utils/email.js';
import { getStripe } from '../services/stripeService.js';

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `LON-${stamp}-${rand}`;
}

function snapshotAddress(addr) {
  return {
    fullName: addr.fullName,
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
  };
}

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddressId, billingAddressId, paymentMethod, stripePaymentIntentId } = req.body;

  if (paymentMethod === 'stripe' && !stripePaymentIntentId) {
    throw ApiError.badRequest('Missing payment confirmation for card payment');
  }

  let paymentIntentStatus = null;
  if (paymentMethod === 'stripe') {
    const intent = await getStripe().paymentIntents.retrieve(stripePaymentIntentId);
    if (intent.status !== 'succeeded') {
      throw ApiError.badRequest('Payment has not been completed');
    }
    paymentIntentStatus = intent.status;
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty');

  const shippingAddress = await Address.findOne({ _id: shippingAddressId, user: req.user._id });
  const billingAddress = billingAddressId
    ? await Address.findOne({ _id: billingAddressId, user: req.user._id })
    : shippingAddress;
  if (!shippingAddress || !billingAddress) throw ApiError.badRequest('Invalid address selected');

  // Verify stock and decrement atomically per item
  for (const item of cart.items) {
    const product = await Product.findOne({ _id: item.product, 'variants.sku': item.sku });
    if (!product) throw ApiError.badRequest(`${item.name} is no longer available`);
    const variant = product.variants.find((v) => v.sku === item.sku);
    if (variant.stock < item.qty) throw ApiError.badRequest(`Not enough stock for ${item.name}`);
  }

  await Promise.all(
    cart.items.map((item) =>
      Product.updateOne(
        { _id: item.product, 'variants.sku': item.sku },
        { $inc: { 'variants.$.stock': -item.qty } }
      )
    )
  );

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  let discount = 0;
  if (cart.coupon?.code) {
    discount =
      cart.coupon.type === 'percent'
        ? subtotal * (cart.coupon.value / 100)
        : Math.min(cart.coupon.value, subtotal);
    await Coupon.updateOne({ code: cart.coupon.code }, { $inc: { usedCount: 1 } });
  }
  const shippingCost = subtotal - discount > 150 ? 0 : 12;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: cart.items,
    shippingAddress: snapshotAddress(shippingAddress),
    billingAddress: snapshotAddress(billingAddress),
    paymentMethod,
    paymentStatus: paymentIntentStatus === 'succeeded' ? 'paid' : 'pending', // Stripe payments flip to 'paid' here (verified above) or via the webhook as a backup; COD stays pending until delivery.
    stripePaymentIntentId: stripePaymentIntentId || null,
    subtotal,
    discount,
    shippingCost,
    total,
    couponCode: cart.coupon?.code || null,
  });

  cart.items = [];
  cart.coupon = { code: null, type: null, value: null };
  await cart.save();

  await Notification.create({
    user: req.user._id,
    type: 'order',
    title: 'Order placed',
    message: `Your order #${order.orderNumber} has been received and is being prepared.`,
    link: `/account/orders/${order._id}`,
  });

  try {
    await sendOrderConfirmationEmail(req.user.email, order);
  } catch {
    // Non-fatal: order is already placed, email is best-effort.
  }

  res.status(201).json({ success: true, order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = order.user.toString() === req.user._id.toString();
  const isStaff = ['admin', 'employee'].includes(req.user.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden('You cannot view this order');

  res.status(200).json({ success: true, order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');
  if (!['pending', 'processing'].includes(order.status)) {
    throw ApiError.badRequest('This order can no longer be cancelled');
  }

  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  await order.save();

  await Promise.all(
    order.items.map((item) =>
      Product.updateOne(
        { _id: item.product, 'variants.sku': item.sku },
        { $inc: { 'variants.$.stock': item.qty } }
      )
    )
  );

  res.status(200).json({ success: true, order });
});

// ---------- Admin ----------

export const listAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (note) order.statusHistory.push({ status, note, changedAt: new Date() });
  await order.save();

  await Notification.create({
    user: order.user,
    type: 'order',
    title: 'Order status updated',
    message: `Order #${order.orderNumber} is now ${status}.`,
    link: `/account/orders/${order._id}`,
  });

  res.status(200).json({ success: true, order });
});

export const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  order.status = 'refunded';
  order.paymentStatus = 'refunded';
  order.statusHistory.push({ status: 'refunded', note: req.body.note || '', changedAt: new Date() });
  await order.save();

  res.status(200).json({ success: true, order });
});
