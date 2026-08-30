/** Inventory is stored per variant. Stock is decremented atomically when an
 * order is created and restored only when that order first becomes cancelled.
 * This keeps checkout safe under concurrent requests without trusting clients. */
export function inventoryStatus(product) {
  if (product.stockStatus === 'coming_soon') return 'coming_soon';
  return (product.variants || []).some((variant) => Number(variant.stock) > 0)
    ? 'in_stock'
    : 'out_of_stock';
}

export function withInventory(product) {
  const value = typeof product.toObject === 'function'
    ? product.toObject({ virtuals: true })
    : { ...product };
  const variants = value.variants || [];
  value.availableStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  value.totalStock = variants.reduce((sum, variant) => sum + Number(variant.totalStock ?? variant.stock ?? 0), 0);
  value.stockStatus = inventoryStatus(value);
  return value;
}
