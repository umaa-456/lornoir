import mongoose from 'mongoose';
import slugify from 'slugify';

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "50ml"
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    notes: {
      top: { type: String, default: '' },
      heart: { type: String, default: '' },
      base: { type: String, default: '' },
    },
    images: { type: [imageSchema], default: [] }, // starts empty — the admin form creates the product first, then uploads images in a second step (storefront falls back to a placeholder until then)
    variants: { type: [variantSchema], validate: (v) => v.length > 0 },
    basePrice: { type: Number, required: true, min: 0 }, // for sorting/filtering across variants
    tags: {
      type: [String],
      enum: ['new', 'bestseller', 'trending', 'featured', 'flash-sale', 'gift-sets'],
      default: [],
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.pre('validate', function setSlugAndPrice(next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  if (this.variants?.length) {
    this.basePrice = Math.min(...this.variants.map((v) => v.price));
  }
  next();
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1, basePrice: 1 });

productSchema.virtual('totalStock').get(function totalStock() {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);
