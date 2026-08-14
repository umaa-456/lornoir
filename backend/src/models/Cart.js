import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: null },
    variantLabel: { type: String, default: null },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    coupon: {
      code: { type: String, default: null },
      type: { type: String, default: null },
      value: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
