import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import FAQSection from '@/components/sections/FAQSection';

export default function Faq() {
  const { settings } = useSiteSettings();
  return (
    <div className="pt-16">
      <Helmet>
        <title>FAQ — {settings.siteName}</title>
        <meta name="description" content={`Answers to common questions about ${settings.siteName}.`} />
      </Helmet>
      <FAQSection />
    </div>
  );
}
