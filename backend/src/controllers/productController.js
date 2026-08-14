import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer, destroyImage } from '../services/cloudinaryService.js';

const SORT_MAP = {
  'price-asc': { basePrice: 1 },
  'price-desc': { basePrice: -1 },
  rating: { rating: -1 },
  newest: { createdAt: -1 },
  featured: { createdAt: -1 },
};

export const listProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    tag,
    sort = 'featured',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (q) filter.$text = { $search: q };

  if (category) {
    const slugs = category.split(',').map((s) => s.trim()).filter(Boolean);
    const cats = await Category.find({ slug: { $in: slugs } }).select('_id');
    if (cats.length) filter.category = { $in: cats.map((c) => c._id) };
  }

  if (brand) {
    const slugs = brand.split(',').map((s) => s.trim()).filter(Boolean);
    const brands = await Brand.find({ slug: { $in: slugs } }).select('_id');
    if (brands.length) filter.brand = { $in: brands.map((b) => b._id) };
  }

  if (minPrice || maxPrice) {
    filter.basePrice = {};
    if (minPrice) filter.basePrice.$gte = Number(minPrice);
    if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
  }

  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (tag) filter.tags = tag;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(48, Number(limit));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .sort(SORT_MAP[sort] || SORT_MAP.featured)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('brand', 'name slug tier')
    .populate('category', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');
  res.status(200).json({ success: true, product });
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw ApiError.notFound('Product not found');

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .populate('brand', 'name slug');

  res.status(200).json({ success: true, products: related });
});

// ---------- Admin ----------

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound('Product not found');
  res.status(200).json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw ApiError.notFound('Product not found');
  res.status(200).json({ success: true, message: 'Product removed' });
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('No images uploaded');
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  const uploaded = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'products')));
  const images = uploaded.map((r) => ({ url: r.secure_url, publicId: r.public_id, alt: product.name }));

  product.images.push(...images);
  await product.save();

  res.status(200).json({ success: true, product });
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  const image = product.images.find((img) => img.publicId === req.params.publicId);
  if (image) await destroyImage(image.publicId);

  product.images = product.images.filter((img) => img.publicId !== req.params.publicId);
  await product.save();

  res.status(200).json({ success: true, product });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate('brand', 'name');
  const lowStock = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= p.lowStockThreshold)
  );
  res.status(200).json({ success: true, products: lowStock });
});

/** Public, aggregated catalogue stats for the homepage trust bar — real
 * numbers instead of hardcoded marketing figures. */
export const getCatalogueStats = asyncHandler(async (req, res) => {
  const [productCount, ratingAgg, brandCount] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.aggregate([
      { $match: { isActive: true, reviewCount: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: '$reviewCount' } } },
    ]),
    Brand.countDocuments({ isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      productCount,
      brandCount,
      avgRating: ratingAgg[0]?.avgRating ? Number(ratingAgg[0].avgRating.toFixed(1)) : null,
      totalReviews: ratingAgg[0]?.totalReviews || 0,
    },
  });
});
