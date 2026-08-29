import { useEffect, useMemo, useState } from 'react';
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

export default function FlashSale() {
  const [sale, setSale] = useState(undefined);
  const target = useMemo(() => sale ? new Date(sale.endsAt) : new Date(), [sale]);
  const { days, hours, minutes, seconds, done } = useCountdown(target);
  useEffect(() => { api.get('/sales/active').then(({ data }) => setSale(data.sale)).catch(() => setSale(null)); }, []);
  const products = Array.isArray(sale?.products) ? sale.products : [];
  if (!sale || products.length === 0) return null;

  return <section className="luxury-dark relative py-24 border-y border-gold/20 overflow-hidden"><div className="absolute inset-0 bg-noir-radial opacity-60" aria-hidden="true" /><div className="relative max-w-7xl mx-auto px-6 md:px-10"><Reveal className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12"><div><p className="eyebrow mb-3">Limited Time</p><h2 className="heading-display text-4xl md:text-5xl">{sale.title}</h2><p className="text-ivory/60 mt-3 max-w-md">{sale.description || 'A limited-time selection curated especially for you.'}</p><p className="text-gold text-xs tracking-widest2 uppercase mt-4">{sale.occasion && `${sale.occasion} · `}{sale.discount}% OFF</p></div>{!done ? <div className="flex gap-6 md:gap-8"><TimeBlock value={days} label="Days" /><TimeBlock value={hours} label="Hours" /><TimeBlock value={minutes} label="Min" /><TimeBlock value={seconds} label="Sec" /></div> : <p className="text-gold font-display text-2xl">The sale has ended.</p>}</Reveal><Reveal delay={0.1}><Swiper modules={[Navigation]} navigation spaceBetween={24} slidesPerView={2} breakpoints={{ 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }} className="!pb-2 flash-sale-swiper">{products.map((product) => <SwiperSlide key={product._id}><ProductCard product={product} /></SwiperSlide>)}</Swiper></Reveal></div></section>;
}
