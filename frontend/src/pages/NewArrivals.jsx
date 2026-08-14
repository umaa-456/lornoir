import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Reveal from '@/components/ui/Reveal';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Loader';
import { productsApi } from '@/services/products';

export default function NewArrivals() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    productsApi
      .list({ tag: 'new', limit: 24 })
      .then((data) => setProducts(data.products))
      .catch(() => toast.error('Could not load new arrivals'));
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
      <Helmet>
        <title>New Arrivals — L'Or Noir</title>
        <meta name="description" content="The latest compositions from L'Or Noir." />
      </Helmet>

      <Reveal className="mb-12 max-w-xl">
        <p className="eyebrow mb-3">Just Composed</p>
        <h1 className="heading-display text-4xl md:text-5xl">New Arrivals</h1>
      </Reveal>

      {!products ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-ivory/50">No new arrivals at the moment — check back soon.</p>
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
