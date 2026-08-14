import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSun,
  HiOutlineMoon,
} from 'react-icons/hi';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const NAV_LINKS = [
  { label: 'Boutique', to: '/shop' },
  { label: 'Maisons', to: '/brands' },
  { label: "L'Art de l'Oud", to: '/shop?category=oud-amber' },
  { label: 'Nouveautés', to: '/new-arrivals' },
  { label: 'Notre Histoire', to: '/about' },
];

export default function Navbar({ cartCount = 0, wishlistCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass py-3 shadow-glass' : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden text-2xl text-gold"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 select-none"
          data-cursor-hover
        >
          {settings.logo?.url ? (
            <img src={settings.logo.url} alt={settings.siteName} className="h-9 md:h-11 w-auto object-contain" />
          ) : (
            <span className="font-script text-2xl md:text-3xl tracking-widest3 uppercase text-gold-sheen">
              {settings.siteName}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              data-cursor-hover
              className={({ isActive }) =>
                `relative font-body text-[13px] tracking-widest2 uppercase transition-colors duration-300 after:content-[''] after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-gold after:transition-all after:duration-300 ${
                  isActive
                    ? 'text-gold after:w-full'
                    : 'text-ivory/80 hover:text-gold after:w-0 hover:after:w-full'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4 md:gap-5 text-xl">
          <button
            aria-label="Search fragrances"
            className="hover:text-gold transition-colors"
            data-cursor-hover
            onClick={() => setSearchOpen(true)}
          >
            <HiOutlineSearch />
          </button>
          <button
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="hidden sm:inline hover:text-gold transition-colors"
            data-cursor-hover
            onClick={toggleTheme}
          >
            {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
          </button>
          <Link to="/account" aria-label="Account" className="hidden sm:inline hover:text-gold transition-colors" data-cursor-hover>
            <HiOutlineUser />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-gold transition-colors" data-cursor-hover>
            <HiOutlineHeart />
            {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
          </Link>
          <Link to="/cart" aria-label="Shopping bag" className="relative hover:text-gold transition-colors" data-cursor-hover>
            <HiOutlineShoppingBag />
            {cartCount > 0 && <CountBadge count={cartCount} />}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden glass mt-3 mx-4 rounded-sm"
          >
            <ul className="flex flex-col divide-y divide-gold/10">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-4 text-sm tracking-widest2 uppercase text-ivory/85 hover:text-gold"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-obsidian/95 backdrop-blur-md flex items-start justify-center pt-32 px-6"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <label htmlFor="global-search" className="eyebrow block mb-3 text-center">
                Search the collection
              </label>
              <input
                id="global-search"
                autoFocus
                type="text"
                placeholder="Oud, Chanel, Santal 33…"
                className="w-full bg-transparent border-b border-gold/40 text-2xl md:text-4xl font-display text-center py-4 focus:outline-none focus:border-gold placeholder:text-ivory/30"
              />
              <button
                className="mt-8 mx-auto block text-xs tracking-widest2 uppercase text-ivory/50 hover:text-gold"
                onClick={() => setSearchOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function CountBadge({ count }) {
  return (
    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gold text-obsidian text-[10px] leading-4 text-center font-body font-bold">
      {count > 9 ? '9+' : count}
    </span>
  );
}
