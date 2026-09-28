import { useCallback, useEffect, useMemo, useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import ProductCard from '@/components/product/ProductCard';
import api from '@/services/api';
import { flattenSaleProducts } from '@/utils/saleProducts';

export default function FlashSale() {
  const [sales, setSales] = useState([]);
  const loadActiveSales = useCallback(() => {
    api.get('/sales/active')
      .then(({ data }) => setSales(Array.isArray(data.sales) ? data.sales : []))
      .catch(() => setSales([]));
  }, []);

  useEffect(() => {
    loadActiveSales();
  }, [loadActiveSales]);

  const saleProducts = useMemo(() => flattenSaleProducts(sales), [sales]);

  // Recheck with the backend when the earliest active campaign expires.
  useEffect(() => {
    const endTimes = sales.map((sale) => new Date(sale.endsAt).getTime()).filter(Number.isFinite);
    if (endTimes.length === 0) return undefined;

    const nextExpiry = Math.min(...endTimes);
    const timeout = window.setTimeout(loadActiveSales, Math.max(0, nextExpiry - Date.now() + 250));
    return () => window.clearTimeout(timeout);
  }, [sales, loadActiveSales]);

  if (saleProducts.length === 0) return null;

  return (
    <section className="luxury-dark relative py-24 border-y border-gold/20 overflow-hidden">
      <div className="absolute inset-0 bg-noir-radial opacity-60" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <Reveal className="mb-12">
          <p className="eyebrow mb-3">Limited Time</p>
          <h2 className="heading-display text-4xl md:text-5xl">Sale Collection</h2>
          <p className="text-ivory/60 mt-3 max-w-md">Explore every product included in our current active offers.</p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8" aria-label="Products on sale">
          {saleProducts.map((product, index) => (
            <Reveal key={product._id} delay={Math.min(index * 0.04, 0.24)}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
