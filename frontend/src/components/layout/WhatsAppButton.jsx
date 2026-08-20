import { FaWhatsapp } from 'react-icons/fa';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSiteSettings();
  const number = (settings.whatsapp?.number || '+923176346085').replace(/\D/g, '');
  const message = settings.whatsapp?.prefilledMessage || 'Assalam-o-Alaikum! ✨\n\nI would like to know more about your products.';
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${settings.siteName} on WhatsApp`}
      title={`Chat with ${settings.siteName} on WhatsApp`}
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[70] w-14 h-14 md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-primary text-white flex items-center justify-center text-3xl shadow-gold border border-gold/50 transition-transform duration-300 hover:scale-105 hover:bg-charcoal focus-visible:outline-white"
    >
      <FaWhatsapp aria-hidden="true" />
    </a>
  );
}
