import Sale from '../models/Sale.js';

export const activeSaleFilter = (productIds, now = new Date()) => ({
  enabled: true,
  startsAt: { $lte: now },
  endsAt: { $gte: now },
  products: { $in: productIds },
});

/** Select one applicable sale per product, preferring the largest discount.
 * For equal discounts, prefer the most recently started campaign so the
 * result is deterministic across catalogue, cart, and homepage responses. */
export function selectBestSalesByProduct(sales) {
  const byProduct = new Map();
  for (const sale of sales) {
    for (const product of sale.products || []) {
      const key = (product?._id || product).toString();
      const current = byProduct.get(key);
      const discount = Number(sale.discount);
      const currentDiscount = Number(current?.discount ?? -1);
      const saleStart = new Date(sale.startsAt || 0).getTime();
      const currentStart = new Date(current?.startsAt || 0).getTime();
      const saleId = (sale._id || '').toString();
      const currentId = (current?._id || '').toString();
      if (!current || discount > currentDiscount || (discount === currentDiscount && (
        saleStart > currentStart || (saleStart === currentStart && saleId < currentId)
      ))) {
        byProduct.set(key, sale);
      }
    }
  }
  return byProduct;
}

/** Select the best active discount per product. This keeps overlapping campaigns
 * deterministic and avoids a per-product lookup in catalogue responses. */
export async function getActiveSalesByProductIds(productIds, now = new Date()) {
  const ids = [...new Set(productIds.filter(Boolean).map((id) => id.toString()))];
  if (!ids.length) return new Map();
  const sales = await Sale.find(activeSaleFilter(ids, now)).lean();
  return selectBestSalesByProduct(sales);
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
