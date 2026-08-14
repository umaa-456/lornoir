import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Reveal from '@/components/ui/Reveal';
import { brandsApi } from '@/services/products';

export default function Brands() {
  const [brands, setBrands] = useState(null);

  useEffect(() => {
    brandsApi.list().then(setBrands).catch(() => toast.error('Could not load maisons'));
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
      <Helmet>
        <title>Maisons — L'Or Noir</title>
        <meta name="description" content="The fragrance houses behind the L'Or Noir collection." />
      </Helmet>

      <Reveal className="mb-14 max-w-2xl">
        <p className="eyebrow mb-3">The Houses</p>
        <h1 className="heading-display text-4xl md:text-5xl mb-6">Maisons</h1>
        <p className="text-ivory/60 leading-relaxed">
          Every composition in our collection comes from one of the houses
          below — each with its own philosophy and approach to fragrance.
        </p>
      </Reveal>

      {brands === null && <p className="text-ivory/50">Loading…</p>}

      {brands?.length === 0 && (
        <div className="glass p-10 text-center text-ivory/50">
          No maisons have been added yet — they'll appear here once created from the admin dashboard.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {brands?.map((brand, i) => (
          <Reveal key={brand._id} delay={i * 0.08}>
            <Link
              to={`/shop?brand=${brand.slug}`}
              data-cursor-hover
              className="group block glass p-8 hover:border-gold/40 border border-transparent transition-colors"
            >
              {brand.logo?.url && (
                <img src={brand.logo.url} alt={`${brand.name} logo`} className="w-12 h-12 rounded-sm object-cover mb-4" />
              )}
              <p className="text-[11px] tracking-widest2 uppercase text-gold/70 mb-2">{brand.tier}</p>
              <h2 className="font-script text-3xl tracking-widest2 uppercase mb-3 group-hover:text-gold transition-colors">
                {brand.name}
              </h2>
              {brand.description && <p className="text-sm text-ivory/50 mb-2">{brand.description}</p>}
              <span className="inline-block mt-2 text-xs text-ivory/40 group-hover:text-gold transition-colors">
                Shop the maison →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
