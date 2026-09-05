/** Inventory is stored per variant. Stock is decremented atomically when an
 * order is created and restored only when that order first becomes cancelled.
 * This keeps checkout safe under concurrent requests without trusting clients. */
export function inventoryStatus(product) {
  if (product.stockStatus === 'coming_soon') return 'coming_soon';
  return (product.variants || []).some((variant) => variant.isActive !== false && Number(variant.stock) > 0)
    ? 'in_stock'
    : 'out_of_stock';
}

export function withInventory(product) {
  const value = typeof product.toObject === 'function'
    ? product.toObject({ virtuals: true })
    : { ...product };
  const variants = value.variants || [];
  const imagesByPublicId = new Map((value.images || []).map((image) => [image.publicId, image]));
  value.variants = variants.map((variant) => ({
    ...variant,
    // Keep legacy variants working while exposing an explicit image for every
    // newly configured design.  No stock is derived from gallery images.
    image: variant.imagePublicId ? imagesByPublicId.get(variant.imagePublicId) || null : null,
  }));
  value.availableStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  value.totalStock = variants.reduce((sum, variant) => sum + Number(variant.totalStock ?? variant.stock ?? 0), 0);
  value.stockStatus = inventoryStatus(value);
  return value;
}
