import Sale from '../models/Sale.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find().sort('-startsAt');
  res.json({ success: true, sales });
});
export const getActiveSale = asyncHandler(async (req, res) => {
  const now = new Date();
  const sale = await Sale.findOne({ enabled: true, startsAt: { $lte: now }, endsAt: { $gt: now } }).sort('-startsAt');
  res.json({ success: true, sale: sale || null });
});
export const createSale = asyncHandler(async (req, res) => {
  const sale = await Sale.create(req.body);
  res.status(201).json({ success: true, sale });
});
export const updateSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) throw ApiError.notFound('Sale not found');
  sale.set(req.body); await sale.save();
  res.json({ success: true, sale });
});
export const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findByIdAndDelete(req.params.id);
  if (!sale) throw ApiError.notFound('Sale not found');
  res.json({ success: true, message: 'Sale deleted' });
});
