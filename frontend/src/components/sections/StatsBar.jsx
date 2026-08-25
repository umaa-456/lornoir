import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/ui/Reveal';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { productsApi } from '@/services/products';

export default function StatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    productsApi.stats().then(setStats).catch(() => setStats(null));
  }, []);

  if (!stats) return null;

  const cards = [
    { to: stats.productCount, label: 'Products in Our Collection', href: '/shop' },
    { to: stats.brandCount, label: 'Brands', href: '/brands' },
    ...(stats.avgRating
      ? [{ display: `${stats.avgRating}/5`, label: 'Average Rating' }]
      : []),
    ...(stats.totalReviews
      ? [{ to: stats.totalReviews, label: 'Customer Reviews' }]
      : []),
  ];

  if (cards.length === 0) return null;

  return (
    <section className="border-y border-gold/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {cards.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="text-center">
            {stat.href ? (
              <Link to={stat.href} className="group block rounded-sm p-3 -m-3 transition-colors hover:bg-gold/10 focus:outline-none focus:ring-1 focus:ring-gold" aria-label={`View ${stat.label.toLowerCase()}`}>
            <p className="font-display text-3xl md:text-4xl text-gold-sheen">
              {stat.display ? stat.display : <AnimatedCounter to={stat.to} />}
            </p>
              <p className="text-[11px] tracking-widest2 uppercase text-ivory/50 mt-2 group-hover:text-gold transition-colors">{stat.label}</p>
              </Link>
            ) : <>
              <p className="font-display text-3xl md:text-4xl text-gold-sheen">
                {stat.display ? stat.display : <AnimatedCounter to={stat.to} />}
              </p>
              <p className="text-[11px] tracking-widest2 uppercase text-ivory/50 mt-2">{stat.label}</p>
            </>}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
