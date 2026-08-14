import Brand from '../models/Brand.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer, destroyImage } from '../services/cloudinaryService.js';

export const listBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort('name');
  res.status(200).json({ success: true, brands });
});

export const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
  if (!brand) throw ApiError.notFound('Brand not found');
  res.status(200).json({ success: true, brand });
});

export const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  res.status(201).json({ success: true, brand });
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!brand) throw ApiError.notFound('Brand not found');
  res.status(200).json({ success: true, brand });
});

export const uploadBrandLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image uploaded');
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw ApiError.notFound('Brand not found');

  if (brand.logo?.publicId) await destroyImage(brand.logo.publicId);
  const result = await uploadBuffer(req.file.buffer, 'brands');
  brand.logo = { url: result.secure_url, publicId: result.public_id };
  await brand.save();

  res.status(200).json({ success: true, brand });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!brand) throw ApiError.notFound('Brand not found');
  res.status(200).json({ success: true, message: 'Brand removed' });
});
