import { Helmet } from 'react-helmet-async';
import FAQSection from '@/components/sections/FAQSection';

export default function Faq() {
  return (
    <div className="pt-16">
      <Helmet>
        <title>FAQ — L'Or Noir</title>
        <meta name="description" content="Answers to common questions about L'Or Noir fragrances, shipping, and returns." />
      </Helmet>
      <FAQSection />
    </div>
  );
}
