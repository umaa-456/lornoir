import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer, destroyImage } from '../services/cloudinaryService.js';
import { getActiveSalesByProductIds, withActiveSale } from '../utils/salePricing.js';
import { withInventory } from '../utils/inventory.js';

const SORT_MAP = {
  'price-asc': { basePrice: 1 },
  'price-desc': { basePrice: -1 },
  rating: { rating: -1 },
  newest: { createdAt: -1 },
  featured: { createdAt: -1 },
};

// The model normally resolves a slug collision before saving. If two requests
// create or rename the same product at precisely the same time, the unique
// slug index is still the final arbiter. Retry only that race by clearing the
// generated slug, which makes the model calculate the next available suffix.
async function saveProductWithSlugRetry(product, attempts = 4) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await product.save();
      return product;
    } catch (err) {
      const duplicateSlug = err?.code === 11000 && (err.keyPattern?.slug || Object.hasOwn(err.keyValue || {}, 'slug'));
      if (!duplicateSlug || attempt === attempts - 1) throw err;
      product.slug = undefined;
    }
  }
}

function validateDesignImages(variants, images) {
  const imageIds = new Set((images || []).map((image) => image.publicId));
  for (const variant of variants || []) {
    if (variant.imagePublicId && !imageIds.has(variant.imagePublicId)) {
      throw ApiError.badRequest(`The image selected for design "${variant.label}" is not in this product gallery`);
    }
  }
}

export const listProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    tag,
    stockStatus,
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
  // `coming_soon` is an admin-controlled state. The other two states are
  // derived from current variant stock, and must be applied before pagination
  // so the returned count and pages stay accurate.
  if (stockStatus === 'coming_soon') filter.stockStatus = stockStatus;
  if (stockStatus === 'in_stock') {
    filter.stockStatus = { $ne: 'coming_soon' };
    filter.variants = { $elemMatch: { stock: { $gt: 0 } } };
  }
  if (stockStatus === 'out_of_stock') {
    filter.stockStatus = { $ne: 'coming_soon' };
    filter.variants = { $not: { $elemMatch: { stock: { $gt: 0 } } } };
  }

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

  const activeSales = await getActiveSalesByProductIds(products.map((product) => product._id));
  res.status(200).json({
    success: true,
    products: products.map(withInventory).map((product) => withActiveSale(product, activeSales)),
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
  const activeSales = await getActiveSalesByProductIds([product._id]);
  res.status(200).json({ success: true, product: withActiveSale(withInventory(product), activeSales) });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('brand', 'name slug')
    .populate('category', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');
  res.status(200).json({ success: true, product: withInventory(product) });
});

// Public, minimal availability projection for revalidating a browser cart.
export const getProductsAvailability = asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || '').split(',').filter((id) => /^[a-f\d]{24}$/i.test(id));
  if (!ids.length) return res.status(200).json({ success: true, products: [] });
  const products = await Product.find({ _id: { $in: ids }, isActive: true })
    .select('_id stockStatus shippingFee variants.sku variants.stock variants.isActive');
  res.status(200).json({ success: true, products: products.map(withInventory) });
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

  const activeSales = await getActiveSalesByProductIds(related.map((item) => item._id));
  res.status(200).json({ success: true, products: related.map((item) => withActiveSale(withInventory(item), activeSales)) });
});

// ---------- Admin ----------

export const createProduct = asyncHandler(async (req, res) => {
  if (Array.isArray(req.body.variants)) {
    req.body.variants = req.body.variants.map((variant) => ({
      ...variant,
      stock: Number(variant.stock),
      totalStock: Number(variant.stock),
    }));
  }
  validateDesignImages(req.body.variants, req.body.images);
  if (req.body.stockStatus === 'out_of_stock') delete req.body.stockStatus;
  const product = new Product(req.body);
  await saveProductWithSlugRetry(product);
  res.status(201).json({ success: true, product: withInventory(product) });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  if (Array.isArray(req.body.variants)) {
    const existing = new Map(product.variants.map((variant) => [variant.sku, variant]));
    req.body.variants = req.body.variants.map((variant) => {
      const requestedTotal = Number(variant.stock);
      const current = existing.get(variant.sku);
      if (!current) return { ...variant, stock: requestedTotal, totalStock: requestedTotal };
      const priorTotal = Number(current.totalStock ?? current.stock);
      const reserved = Math.max(0, priorTotal - Number(current.stock));
      return { ...variant, stock: Math.max(0, requestedTotal - reserved), totalStock: requestedTotal };
    });
  }
  if (Array.isArray(req.body.variants)) validateDesignImages(req.body.variants, product.images);
  if (req.body.stockStatus === 'out_of_stock') delete req.body.stockStatus;
  product.set(req.body);
  await saveProductWithSlugRetry(product);
  res.status(200).json({ success: true, product: withInventory(product) });
});

export const reorderProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  const requestedIds = req.body.publicIds;
  if (!Array.isArray(requestedIds) || requestedIds.length !== product.images.length) {
    throw ApiError.badRequest('Provide every existing image when reordering');
  }
  const imageMap = new Map(product.images.map((image) => [image.publicId, image]));
  if (new Set(requestedIds).size !== product.images.length || requestedIds.some((publicId) => !imageMap.has(publicId))) {
    throw ApiError.badRequest('Invalid image order');
  }
  product.images = requestedIds.map((publicId) => imageMap.get(publicId));
  await product.save();
  res.status(200).json({ success: true, product: withInventory(product) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  product.isActive = false;
  // Keep historical order references intact while freeing the customer-facing
  // slug for a future product with the same name.
  product.slug = `${product.slug}-archived-${product._id.toString().slice(-6)}`;
  await product.save();
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

  res.status(200).json({ success: true, product: withInventory(product) });
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  const image = product.images.find((img) => img.publicId === req.params.publicId);
  if (image) await destroyImage(image.publicId);

  product.images = product.images.filter((img) => img.publicId !== req.params.publicId);
  // Do not leave a design pointing to a deleted gallery image. Its inventory
  // remains intact; the admin can associate a replacement image on edit.
  product.variants.forEach((variant) => {
    if (variant.imagePublicId === req.params.publicId) variant.imagePublicId = null;
  });
  await product.save();

  res.status(200).json({ success: true, product: withInventory(product) });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).populate('brand', 'name');
  const lowStock = products.filter((p) =>
    p.variants.some((v) => v.stock > 0 && v.stock <= p.lowStockThreshold)
  ).map(withInventory);
  res.status(200).json({ success: true, products: lowStock });
});

export const listSaleProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .select('name slug images variants basePrice')
    .sort('name')
    .lean();
  res.status(200).json({ success: true, products });
});

// Dedicated product projection for the Shipping Management console. Products
// stay the sole source of truth; this is not a separate shipping catalogue.
export const listShippingProducts = asyncHandler(async (req, res) => {
  const { q = '', status = 'all', page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 20));
  const filter = { isActive: true };
  const query = String(q).trim();
  if (query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: escaped, $options: 'i' } }, { 'variants.sku': { $regex: escaped, $options: 'i' } }];
  }
  if (status === 'configured') filter.shippingFee = { $ne: null };
  if (status === 'not_configured') filter.shippingFee = null;
  if (status === 'free') filter.shippingFee = 0;

  const [products, total] = await Promise.all([
    Product.find(filter).select('name images variants basePrice shippingFee stockStatus').sort('name').skip((pageNum - 1) * limitNum).limit(limitNum),
    Product.countDocuments(filter),
  ]);
  res.status(200).json({
    success: true,
    products: products.map(withInventory),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});

export const updateProductShippingFee = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found');
  product.shippingFee = Number(req.body.shippingFee);
  await product.save();
  res.status(200).json({ success: true, product: withInventory(product) });
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
