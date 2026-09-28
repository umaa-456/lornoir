/** Flatten active campaign products and keep one winning discount per product. */
export function flattenSaleProducts(sales) {
  const productsById = new Map();

  for (const sale of Array.isArray(sales) ? sales : []) {
    for (const product of Array.isArray(sale.products) ? sale.products : []) {
      if (!product?._id) continue;

      const saleInfo = product.activeSale || {
        _id: sale._id,
        title: sale.title,
        occasion: sale.occasion,
        discount: sale.discount,
        startsAt: sale.startsAt,
        endsAt: sale.endsAt,
      };
      const productForSale = product.activeSale ? product : { ...product, activeSale: saleInfo };
      const productId = product._id.toString();
      const current = productsById.get(productId);

      if (!current || Number(saleInfo.discount) > Number(current.activeSale?.discount || 0)) {
        productsById.set(productId, productForSale);
      }
    }
  }

  return [...productsById.values()];
}
