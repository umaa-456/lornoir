import SiteSettings from '../models/SiteSettings.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer, destroyImage } from '../services/cloudinaryService.js';

export const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  res.status(200).json({ success: true, settings });
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  const { siteName, currency, whatsapp, hero, footerTagline, contact, shipping } = req.body;

  if (siteName !== undefined) settings.siteName = siteName;
  if (currency !== undefined) settings.currency = currency;
  if (whatsapp) settings.whatsapp = { ...settings.whatsapp.toObject(), ...whatsapp };
  if (hero) settings.hero = { ...settings.hero.toObject(), ...hero };
  if (footerTagline !== undefined) settings.footerTagline = footerTagline;
  if (contact) settings.contact = { ...settings.contact.toObject(), ...contact };
  if (shipping) {
    const fixedCharge = shipping.fixedCharge === undefined ? settings.shipping.fixedCharge : Number(shipping.fixedCharge);
    if (!Number.isFinite(fixedCharge) || fixedCharge < 0) throw ApiError.badRequest('Shipping fee must be a non-negative number');
    if (shipping.freeShipping !== undefined && typeof shipping.freeShipping !== 'boolean') {
      throw ApiError.badRequest('Free shipping must be a boolean value');
    }
    settings.shipping = { ...settings.shipping.toObject(), ...shipping, fixedCharge };
  }

  await settings.save();
  res.status(200).json({ success: true, settings });
});

export const uploadSiteLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image uploaded');

  const settings = await SiteSettings.getSingleton();
  if (settings.logo?.publicId) await destroyImage(settings.logo.publicId);

  const result = await uploadBuffer(req.file.buffer, 'branding');
  settings.logo = { url: result.secure_url, publicId: result.public_id };
  await settings.save();

  res.status(200).json({ success: true, settings });
});

export const removeSiteLogo = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  if (settings.logo?.publicId) await destroyImage(settings.logo.publicId);
  settings.logo = { url: null, publicId: null };
  await settings.save();
  res.status(200).json({ success: true, settings });
});
