import { useCallback, useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Reveal from '@/components/ui/Reveal';
import ProductCard from '@/components/product/ProductCard';
import useCountdown from '@/hooks/useCountdown';
import api from '@/services/api';

function TimeBlock({ value, label }) {
  return <div className="flex flex-col items-center"><span className="font-display text-3xl md:text-4xl text-gold-sheen tabular-nums">{String(value).padStart(2, '0')}</span><span className="text-[10px] tracking-widest2 uppercase text-ivory/50 mt-1">{label}</span></div>;
}

function SaleCampaign({ sale, index, onSaleEnd }) {
  const target = useMemo(() => new Date(sale.endsAt), [sale.endsAt]);
  const { days, hours, minutes, seconds, done } = useCountdown(target);
  const products = Array.isArray(sale.products) ? sale.products : [];

  useEffect(() => {
    if (done) onSaleEnd();
  }, [done, onSaleEnd]);

  if (products.length === 0) return null;

  return (
    <Reveal delay={Math.min(index * 0.06, 0.3)}>
      <article className="h-full border border-gold/25 bg-obsidian/25 p-5 md:p-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 mb-8">
          <div>
            <p className="eyebrow mb-3">Limited Time</p>
            <h2 className="heading-display text-3xl md:text-4xl">{sale.title}</h2>
            <p className="text-ivory/60 mt-3 max-w-md">
              {sale.description || 'A limited-time selection curated especially for you.'}
            </p>
            <p className="text-gold text-xs tracking-widest2 uppercase mt-4">
              {sale.occasion && `${sale.occasion} · `}{sale.discount}% OFF
            </p>
          </div>
          {!done ? (
            <div className="flex gap-4 md:gap-6 shrink-0">
              <TimeBlock value={days} label="Days" />
              <TimeBlock value={hours} label="Hours" />
              <TimeBlock value={minutes} label="Min" />
              <TimeBlock value={seconds} label="Sec" />
            </div>
          ) : <p className="text-gold font-display text-2xl">The sale has ended.</p>}
        </div>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{ 1200: { slidesPerView: 2 } }}
          className="!pb-2 flash-sale-swiper"
          aria-label={`${sale.title} products`}
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </article>
    </Reveal>
  );
}

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

  if (sales.length === 0) return null;

  return (
    <section className="luxury-dark relative py-24 border-y border-gold/20 overflow-hidden">
      <div className="absolute inset-0 bg-noir-radial opacity-60" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className={`grid grid-cols-1 gap-6 ${sales.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {sales.map((sale, index) => (
            <SaleCampaign key={sale._id} sale={sale} index={index} onSaleEnd={loadActiveSales} />
          ))}
        </div>
      </div>
    </section>
  );
}
