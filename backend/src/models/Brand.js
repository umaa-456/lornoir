import mongoose from 'mongoose';
import slugify from 'slugify';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    tier: { type: String, default: 'House' },
    description: { type: String, default: '' },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

brandSchema.pre('validate', function setSlug(next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default mongoose.model('Brand', brandSchema);
