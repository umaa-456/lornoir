import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/ui/Reveal';
import { categoriesApi } from '@/services/products';
import { placeholderSwatch } from '@/utils/placeholderSwatch';

export default function CategoryShowcase() {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (categories !== null && categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-8">
      <Reveal className="mb-10">
        <p className="eyebrow mb-3">Fragrance Families</p>
        <h2 className="heading-display text-4xl md:text-5xl max-w-lg">Find the scent that already feels like you.</h2>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {(categories || Array.from({ length: 4 })).slice(0, 4).map((cat, i) =>
          cat ? (
            <Reveal key={cat.slug} delay={i * 0.08}>
              <Link
                to={`/shop?category=${cat.slug}`}
                data-cursor-hover
                className="group relative block aspect-[4/5] overflow-hidden rounded-sm"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                  style={{
                    background: cat.image?.url
                      ? `url(${cat.image.url}) center/cover no-repeat`
                      : placeholderSwatch(cat.name),
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-display text-xl md:text-2xl text-ivory">{cat.name}</p>
                  <span className="text-[10px] tracking-widest2 uppercase text-gold/0 group-hover:text-gold/90 transition-colors duration-300">
                    Shop now →
                  </span>
                </div>
              </Link>
            </Reveal>
          ) : (
            <div key={i} className="skeleton aspect-[4/5] rounded-sm" />
          )
        )}
      </div>
    </section>
  );
}
