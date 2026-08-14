import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/ui/Reveal';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Loader';
import { productsApi } from '@/services/products';

const TABS = [
  { key: 'featured', label: 'Featured' },
  { key: 'trending', label: 'Trending' },
  { key: 'new', label: 'New Arrivals' },
  { key: 'bestseller', label: 'Best Sellers' },
];

export default function ProductShowcase() {
  const [active, setActive] = useState('featured');
  const [products, setProducts] = useState(null);

  useEffect(() => {
    setProducts(null);
    productsApi
      .list({ tag: active, limit: 8 })
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, [active]);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
      <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <p className="eyebrow mb-3">The Collection</p>
          <h2 className="heading-display text-4xl md:text-5xl">Compositions worth discovering</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              data-cursor-hover
              className={`px-4 py-2 text-[11px] tracking-widest2 uppercase border transition-colors duration-300 ${
                active === tab.key
                  ? 'border-gold bg-gold text-obsidian font-semibold'
                  : 'border-gold/25 text-ivory/60 hover:border-gold/60 hover:text-gold'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Reveal>

      {!products ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-ivory/50 text-center py-16">
          No products tagged "{TABS.find((t) => t.key === active)?.label}" yet — add some from the admin dashboard.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, i) => (
            <Reveal key={product._id} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal className="text-center mt-14">
        <Link
          to="/shop"
          data-cursor-hover
          className="inline-block px-9 py-4 text-xs tracking-widest2 uppercase border border-gold/40 text-ivory/80 hover:border-gold hover:text-gold transition-colors"
        >
          View Full Collection
        </Link>
      </Reveal>
    </section>
  );
}
