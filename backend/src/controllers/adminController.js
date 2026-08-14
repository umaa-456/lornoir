import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenueAgg,
    orderCount,
    customerCount,
    productCount,
    pendingOrders,
    lowStockCount,
    recentOrders,
    salesByDay,
    topProducts,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ status: 'pending' }),
    Product.find({ isActive: true }).then(
      (products) =>
        products.filter((p) => p.variants.some((v) => v.stock > 0 && v.stock <= p.lowStockThreshold)).length
    ),
    Order.find().sort('-createdAt').limit(8).populate('user', 'name email'),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', unitsSold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      orderCount,
      customerCount,
      productCount,
      pendingOrders,
      lowStockCount,
    },
    recentOrders,
    salesByDay,
    topProducts,
  });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const { role, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    users,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

/** Lets an admin create a staff (employee/admin) account directly, in one
 * step — skipping the normal self-signup flow entirely. Admin-only: an
 * employee must never be able to create another admin or employee. */
export const createStaffMember = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required');
  }
  if (!['employee', 'admin'].includes(role)) {
    throw ApiError.badRequest('Role must be either "employee" or "admin"');
  }
  if (password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({
    name,
    email,
    password, // hashed automatically by the User model's pre-save hook
    role,
    isEmailVerified: true, // admin-created accounts skip the verification email
  });

  res.status(201).json({ success: true, user: user.toSafeObject() });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'employee', 'admin'].includes(role)) throw ApiError.badRequest('Invalid role');

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) throw ApiError.notFound('User not found');

  res.status(200).json({ success: true, user });
});

export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

export const listAllReviewsForModeration = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort('-createdAt')
    .limit(100);
  res.status(200).json({ success: true, reviews });
});

export const deleteReviewAsAdmin = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  res.status(200).json({ success: true, message: 'Review removed' });
});
