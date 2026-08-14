import { Helmet } from 'react-helmet-async';
import Hero from '@/components/sections/Hero';
import StatsBar from '@/components/sections/StatsBar';
import ProductShowcase from '@/components/sections/ProductShowcase';
import CategoryShowcase from '@/components/sections/CategoryShowcase';
import FlashSale from '@/components/sections/FlashSale';
import Testimonials from '@/components/sections/Testimonials';
import FAQSection from '@/components/sections/FAQSection';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>L'Or Noir — Maison de Parfum</title>
        <meta
          name="description"
          content="Rare fragrances, hand-composed in small batches. Discover eau de parfum, oud, and attars from L'Or Noir."
        />
      </Helmet>
      <Hero />
      <StatsBar />
      <ProductShowcase />
      <CategoryShowcase />
      <FlashSale />
      <Testimonials />
      <FAQSection />
    </>
  );
}
