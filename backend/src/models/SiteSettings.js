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
    siteName: { type: String, default: 'Store', trim: true },
    currency: { type: String, default: 'PKR', trim: true, uppercase: true },
    whatsapp: {
      number: { type: String, default: '+923176346085', trim: true },
      prefilledMessage: {
        type: String,
        default: 'Assalam-o-Alaikum! ✨\n\nI would like to know more about your products.',
      },
      businessGreeting: {
        type: String,
        default: 'Assalam-o-Alaikum! ✨\n\nWelcome.\n\nThank you for reaching out to us. Your message has been received successfully, and our team will get back to you shortly.\n\nWe believe in offering not only premium products, but also a trusted and comfortable shopping experience.\n\nDelivery Across Pakistan\nCash on Delivery Available\nNo Advance Payment Required\nPay Only When Your Parcel Is Delivered\n\nYour trust is our priority, and every order is handled with care.\n\nQuality You Can Trust. Elegance You Can Experience. ✨\n\nThank you for choosing us.',
      },
    },
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
      email: { type: String, default: 'hello@arwastore.pk' },
      phone: { type: String, default: '+92 317 6346085' },
      address: { type: String, default: 'Pakistan' },
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
