import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  occasion: { type: String, default: '', trim: true, maxlength: 160 },
  discount: { type: String, required: true, trim: true, maxlength: 80 },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

saleSchema.pre('validate', function validateDates(next) {
  if (this.startsAt && this.endsAt && this.endsAt <= this.startsAt) this.invalidate('endsAt', 'End time must be after start time');
  next();
});
saleSchema.index({ enabled: 1, startsAt: 1, endsAt: 1 });
export default mongoose.model('Sale', saleSchema);
