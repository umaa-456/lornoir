import { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Reveal from '@/components/ui/Reveal';
import ProductCard from '@/components/product/ProductCard';
import useCountdown from '@/hooks/useCountdown';
import { productsApi } from '@/services/products';

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl md:text-4xl text-gold-sheen tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] tracking-widest2 uppercase text-ivory/50 mt-1">{label}</span>
    </div>
  );
}

export default function FlashSale() {
  const target = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(23, 59, 59, 0);
    return d;
  }, []);
  const { days, hours, minutes, seconds, done } = useCountdown(target);
  const [saleProducts, setSaleProducts] = useState(null);

  useEffect(() => {
    productsApi
      .list({ tag: 'flash-sale', limit: 12 })
      .then((data) => setSaleProducts(data.products))
      .catch(() => setSaleProducts([]));
  }, []);

  // Nothing tagged for a flash sale right now — skip the section entirely
  // rather than showing an empty countdown with no products under it.
  if (saleProducts !== null && saleProducts.length === 0) return null;

  return (
    <section className="relative py-24 border-y border-gold/10 overflow-hidden">
      <div className="absolute inset-0 bg-noir-radial opacity-60" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <Reveal className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
          <div>
            <p className="eyebrow mb-3">Limited Time</p>
            <h2 className="heading-display text-4xl md:text-5xl">The Midnight Sale</h2>
            <p className="text-ivory/60 mt-3 max-w-md">
              A small selection, discounted for a short window only. Once the
              clock runs out, prices return.
            </p>
          </div>

          {!done ? (
            <div className="flex gap-6 md:gap-8">
              <TimeBlock value={days} label="Days" />
              <TimeBlock value={hours} label="Hours" />
              <TimeBlock value={minutes} label="Min" />
              <TimeBlock value={seconds} label="Sec" />
            </div>
          ) : (
            <p className="text-gold font-display text-2xl">The sale has ended.</p>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={24}
            slidesPerView={2}
            breakpoints={{ 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
            className="!pb-2 flash-sale-swiper"
          >
            {saleProducts?.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}
