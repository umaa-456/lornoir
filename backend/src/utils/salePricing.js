import Sale from '../models/Sale.js';

export const activeSaleFilter = (productIds, now = new Date()) => ({
  enabled: true,
  startsAt: { $lte: now },
  endsAt: { $gte: now },
  products: { $in: productIds },
});

/** Select the best active discount per product. This keeps overlapping campaigns
 * deterministic and avoids a per-product lookup in catalogue responses. */
export async function getActiveSalesByProductIds(productIds, now = new Date()) {
  const ids = [...new Set(productIds.filter(Boolean).map((id) => id.toString()))];
  if (!ids.length) return new Map();
  const sales = await Sale.find(activeSaleFilter(ids, now)).lean();
  const byProduct = new Map();
  for (const sale of sales) {
    for (const id of sale.products || []) {
      const key = id.toString();
      const current = byProduct.get(key);
      if (!current || sale.discount > current.discount) byProduct.set(key, sale);
    }
  }
  return byProduct;
}

export function salePrice(regularPrice, sale) {
  if (!sale) return Number(regularPrice);
  return Math.round(Number(regularPrice) * (1 - Number(sale.discount) / 100) * 100) / 100;
}

export function withActiveSale(product, salesByProduct) {
  const plain = product?.toObject ? product.toObject() : product;
  if (!plain) return plain;
  const sale = salesByProduct.get(plain._id.toString());
  if (!sale) return { ...plain, activeSale: null };
  return {
    ...plain,
    activeSale: {
      _id: sale._id,
      title: sale.title,
      occasion: sale.occasion,
      discount: sale.discount,
      startsAt: sale.startsAt,
      endsAt: sale.endsAt,
    },
  };
}
