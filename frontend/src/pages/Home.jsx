import { Helmet } from 'react-helmet-async';
import Hero from '@/components/sections/Hero';
import StatsBar from '@/components/sections/StatsBar';
import ProductShowcase from '@/components/sections/ProductShowcase';
import CategoryShowcase from '@/components/sections/CategoryShowcase';
import FlashSale from '@/components/sections/FlashSale';
import Testimonials from '@/components/sections/Testimonials';
import FAQSection from '@/components/sections/FAQSection';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function Home() {
  const { settings } = useSiteSettings();
  return (
    <>
      <Helmet>
        <title>{settings.siteName}</title>
        <meta
          name="description"
          content={settings.footerTagline || `Shop ${settings.siteName} online.`}
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
