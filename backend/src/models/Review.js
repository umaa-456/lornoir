import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    images: [{ url: String, publicId: String }],
    helpfulCount: { type: Number, default: 0 },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

async function recalcProductRating(productId) {
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats[0]?.avgRating?.toFixed(1) || 0,
    reviewCount: stats[0]?.count || 0,
  });
}

reviewSchema.post('save', function afterSave() {
  recalcProductRating(this.product);
});

reviewSchema.post('findOneAndDelete', function afterDelete(doc) {
  if (doc) recalcProductRating(doc.product);
});

export default mongoose.model('Review', reviewSchema);
