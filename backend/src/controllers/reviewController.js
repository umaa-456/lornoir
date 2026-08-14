import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer } from '../services/cloudinaryService.js';

export const listProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw ApiError.notFound('Product not found');

  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.status(200).json({ success: true, reviews });
});

/** Top-rated reviews across the whole catalogue, for homepage testimonials. */
export const getFeaturedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ rating: { $gte: 4 } })
    .populate('user', 'name')
    .populate('product', 'name slug')
    .sort('-rating -helpfulCount -createdAt')
    .limit(8);

  res.status(200).json({ success: true, reviews });
});

export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) throw ApiError.notFound('Product not found');

  const alreadyReviewed = await Review.findOne({ product: product._id, user: req.user._id });
  if (alreadyReviewed) throw ApiError.conflict('You have already reviewed this product');

  const isVerifiedPurchase = await Order.exists({
    user: req.user._id,
    'items.product': product._id,
    status: { $in: ['delivered', 'shipped', 'processing'] },
  });

  let images = [];
  if (req.files?.length) {
    const uploaded = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'reviews')));
    images = uploaded.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
  }

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
    images,
    isVerifiedPurchase: Boolean(isVerifiedPurchase),
  });

  res.status(201).json({ success: true, review });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');

  if (req.body.rating) review.rating = req.body.rating;
  if (req.body.comment) review.comment = req.body.comment;
  await review.save();

  res.status(200).json({ success: true, review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');
  res.status(200).json({ success: true, message: 'Review deleted' });
});

export const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulCount: 1 } },
    { new: true }
  );
  if (!review) throw ApiError.notFound('Review not found');
  res.status(200).json({ success: true, review });
});
