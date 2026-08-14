import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaInstagram, FaTiktok, FaPinterestP, FaFacebookF } from 'react-icons/fa';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const COLUMNS = [
  {
    title: 'Boutique',
    links: [
      { label: 'All Fragrances', to: '/shop' },
      { label: 'New Arrivals', to: '/new-arrivals' },
      { label: 'Best Sellers', to: '/best-sellers' },
      { label: 'Gift Sets', to: '/shop?category=gift-sets' },
    ],
  },
  {
    title: 'Maison',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Journal', to: '/journal' },
      { label: 'Sustainability', to: '/sustainability' },
      { label: 'Boutiques', to: '/stores' },
    ],
  },
  {
    title: 'Client Care',
    links: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'Shipping & Returns', to: '/shipping' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Track Order', to: '/track-order' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const { settings } = useSiteSettings();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    toast.success(`Welcome to ${settings.siteName} — check your inbox.`);
    setEmail('');
  };

  return (
    <footer className="relative bg-obsidian border-t border-gold/10 mt-32">
      <div className="hairline absolute -top-px left-0 right-0" />

      {/* Newsletter */}
      <div className="max-w-3xl mx-auto text-center px-6 pt-20 pb-16">
        <p className="eyebrow mb-4">The Journal, Delivered</p>
        <h3 className="heading-display text-3xl md:text-4xl mb-6">
          Be the first to discover our next composition.
        </h3>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            aria-label="Email address"
            className="flex-1 bg-transparent border border-gold/30 px-5 py-3 text-sm focus:outline-none focus:border-gold placeholder:text-ivory/40"
          />
          <button
            type="submit"
            data-cursor-hover
            className="px-7 py-3 text-xs tracking-widest2 uppercase bg-gold text-obsidian font-semibold hover:bg-gold-pale transition-colors duration-300"
          >
            Subscribe
          </button>
        </form>
      </div>

      <div className="hairline max-w-7xl mx-auto" />

      {/* Link columns */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-2">
          {settings.logo?.url ? (
            <img src={settings.logo.url} alt={settings.siteName} className="h-10 w-auto object-contain mb-4" />
          ) : (
            <p className="font-script text-2xl tracking-widest3 uppercase text-gold-sheen mb-4">{settings.siteName}</p>
          )}
          <p className="text-sm text-ivory/60 leading-relaxed max-w-xs">
            {settings.footerTagline}
          </p>
          <div className="flex gap-4 mt-6 text-lg text-ivory/60">
            <a href="#" aria-label="Instagram" data-cursor-hover className="hover:text-gold transition-colors"><FaInstagram /></a>
            <a href="#" aria-label="TikTok" data-cursor-hover className="hover:text-gold transition-colors"><FaTiktok /></a>
            <a href="#" aria-label="Pinterest" data-cursor-hover className="hover:text-gold transition-colors"><FaPinterestP /></a>
            <a href="#" aria-label="Facebook" data-cursor-hover className="hover:text-gold transition-colors"><FaFacebookF /></a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="eyebrow mb-5">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-ivory/70 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="hairline max-w-7xl mx-auto" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/40">
        <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-gold">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
