import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  occasion: { type: String, default: '', trim: true, maxlength: 160 },
  discount: { type: Number, required: true, min: 0.01, max: 100 },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

saleSchema.pre('validate', function validateDates(next) {
  if (this.startsAt && this.endsAt && this.endsAt <= this.startsAt) this.invalidate('endsAt', 'End time must be after start time');
  if (Array.isArray(this.products)) {
    this.products = [...new Set(this.products.map((id) => id.toString()))];
  }
  next();
});
saleSchema.index({ enabled: 1, startsAt: 1, endsAt: 1 });
export default mongoose.model('Sale', saleSchema);
