import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Reveal from '@/components/ui/Reveal';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Loader';
import { productsApi } from '@/services/products';

export default function BestSellers() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    productsApi
      .list({ tag: 'bestseller', limit: 24 })
      .then((data) => setProducts(data.products))
      .catch(() => toast.error('Could not load best sellers'));
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
      <Helmet>
        <title>Best Sellers — L'Or Noir</title>
        <meta name="description" content="The most-loved fragrances in the L'Or Noir collection." />
      </Helmet>

      <Reveal className="mb-12 max-w-xl">
        <p className="eyebrow mb-3">Most Loved</p>
        <h1 className="heading-display text-4xl md:text-5xl">Best Sellers</h1>
      </Reveal>

      {!products ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-ivory/50">No best sellers to show yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, i) => (
            <Reveal key={product._id} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
