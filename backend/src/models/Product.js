import mongoose from 'mongoose';
import slugify from 'slugify';

const variantSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "50ml"
    // SKUs are merchant-supplied labels, not global product identifiers.
    // The product id plus SKU identifies a cart/order line, so the same SKU
    // can legitimately be used on more than one product.
    sku: { type: String, required: true },
    // A design is a sellable variant.  It may point at one image in the
    // product gallery; inventory, SKU and that image therefore travel
    // together without introducing a second stock model.
    imagePublicId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    // `stock` is the quantity currently available to sell. `totalStock` is
    // the administrator's inventory ceiling, retained so the console can
    // show both total and available stock after orders reserve units.
    totalStock: { type: Number, min: 0, default: null },
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
    // `null` deliberately means the administrator has not configured product
    // shipping yet. An explicit 0 means this product ships free.
    shippingFee: { type: Number, default: null, min: 0 },
    tags: {
      type: [String],
      enum: ['new', 'bestseller', 'trending', 'featured', 'flash-sale', 'gift-sets'],
      default: [],
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'coming_soon'],
      default: 'in_stock',
    },
    isActive: { type: Boolean, default: true },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.pre('validate', async function setSlugAndPrice() {
  if (this.name && (this.isNew || this.isModified('name') || !this.slug)) {
    const baseSlug = slugify(this.name, { lower: true, strict: true }) || 'product';
    let candidate = baseSlug;
    let suffix = 2;
    while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${baseSlug}-${suffix++}`;
    }
    this.slug = candidate;
  }
  if (this.variants?.length) {
    const skus = this.variants.map((variant) => variant.sku?.trim()).filter(Boolean);
    if (new Set(skus).size !== skus.length) {
      this.invalidate('variants', 'Each design must have a unique SKU within this product');
    }
    this.basePrice = Math.min(...this.variants.map((v) => v.price));
  }
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1, basePrice: 1 });

productSchema.virtual('totalStock').get(function totalStock() {
  // Product projections used by reviews and order history may deliberately
  // omit variants. Virtuals are still evaluated during serialization, so a
  // missing projection must mean "stock not selected", not a 500 response.
  return (this.variants || []).reduce((sum, v) => sum + (v.totalStock ?? v.stock), 0);
});

productSchema.virtual('availableStock').get(function availableStock() {
  return (this.variants || []).reduce((sum, v) => sum + v.stock, 0);
});

productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);
