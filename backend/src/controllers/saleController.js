import Sale from '../models/Sale.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';
import { selectBestSalesByProduct, withActiveSale } from '../utils/salePricing.js';

async function validateProducts(productIds) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw ApiError.badRequest('Select at least one product for this sale');
  }
  const uniqueIds = [...new Set(productIds.map(String))];
  const count = await Product.countDocuments({ _id: { $in: uniqueIds }, isActive: true });
  if (count !== uniqueIds.length) throw ApiError.badRequest('One or more selected products are unavailable');
  return uniqueIds;
}

export const listSales = asyncHandler(async (req, res) => {
  const sales = await Sale.find().populate('products', 'name slug images').sort('-startsAt');
  res.json({ success: true, sales });
});
export const getActiveSale = asyncHandler(async (req, res) => {
  const now = new Date();
  const activeSales = await Sale.find({ enabled: true, startsAt: { $lte: now }, endsAt: { $gte: now } })
    .populate({ path: 'products', match: { isActive: true } })
    .sort({ discount: -1, startsAt: -1, _id: 1 });
  const salesWithProducts = activeSales.filter((sale) => sale.products?.length);
  const bestSaleByProduct = selectBestSalesByProduct(salesWithProducts);
  const sales = salesWithProducts.map((sale) => {
    const responseSale = sale.toObject();
    const includedProductIds = new Set();
    responseSale.products = sale.products.filter((product) => {
      const productId = product._id.toString();
      if (includedProductIds.has(productId) || !bestSaleByProduct.get(productId)?._id.equals(sale._id)) return false;
      includedProductIds.add(productId);
      return true;
    }).map((product) => withActiveSale(product, bestSaleByProduct));
    return responseSale;
  }).filter((sale) => sale.products.length);
  res.json({ success: true, sales });
});
export const createSale = asyncHandler(async (req, res) => {
  const products = await validateProducts(req.body.products);
  const sale = await Sale.create({ ...req.body, products });
  res.status(201).json({ success: true, sale });
});
export const updateSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) throw ApiError.notFound('Sale not found');
  const update = { ...req.body };
  if (Object.hasOwn(update, 'products')) update.products = await validateProducts(update.products);
  sale.set(update); await sale.save();
  res.json({ success: true, sale });
});
export const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findByIdAndDelete(req.params.id);
  if (!sale) throw ApiError.notFound('Sale not found');
  res.json({ success: true, message: 'Sale deleted' });
});
