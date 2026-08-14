import mongoose from 'mongoose';

/**
 * Singleton document (there is only ever one) holding the site's
 * brand identity and the handful of marketing text blocks that are
 * genuinely worth editing without a code deploy — hero copy, footer
 * tagline, and contact details. Everything else (About story, FAQ
 * answers, legal pages) stays as ordinary page content for now.
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "L'Or Noir", trim: true },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    hero: {
      eyebrow: { type: String, default: 'The 2026 Collection — No. VII' },
      titleLine1: { type: String, default: 'Scent is the' },
      titleLine2: { type: String, default: 'only memory' },
      titleLine3: { type: String, default: 'that never fades.' },
      subtitle: {
        type: String,
        default:
          "Hand-composed in small batches from rare oud, orris root, and centuries-old distillation houses — worn, not sprayed.",
      },
    },
    footerTagline: {
      type: String,
      default:
        'Rare fragrances, hand-composed in small batches for those who wear scent as a signature, not an accessory.',
    },
    contact: {
      email: { type: String, default: 'hello@lornoir.com' },
      phone: { type: String, default: '+1 (415) 555-0142' },
      address: { type: String, default: '24 Rue de la Paix, Paris' },
    },
  },
  { timestamps: true }
);

/** There is only ever one settings document — this fetches it, creating
 * the default one on first use so the site always has something to render. */
siteSettingsSchema.statics.getSingleton = async function getSingleton() {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

export default mongoose.model('SiteSettings', siteSettingsSchema);
