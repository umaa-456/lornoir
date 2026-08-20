import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
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
import { categoriesApi } from '@/services/products';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Collections', to: '/shop', hasCategories: true },
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Best Sellers', to: '/best-sellers' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
];

export default function Navbar({ cartCount = 0, wishlistCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [logoFailed, setLogoFailed] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const isHomeHero = pathname === '/' && !scrolled;
  const isCollectionsRoute = pathname === '/shop' || pathname.startsWith('/product/');

  const navLinkClass = (isActive) =>
    `relative font-body text-[13px] tracking-widest2 uppercase transition-colors duration-300 after:content-[''] after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-gold after:transition-all after:duration-300 ${
      isActive
        ? 'text-gold after:w-full'
        : `${isHomeHero ? 'text-white/90 hover:text-gold' : 'text-ivory/80 hover:text-gold'} after:w-0 hover:after:w-full`
    }`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLogoFailed(false);
  }, [settings.logo?.url]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isHomeHero ? 'bg-transparent py-6 text-white' : 'glass py-3 shadow-glass text-ivory'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between gap-3 xl:grid xl:grid-cols-[minmax(9rem,1fr)_auto_minmax(10rem,1fr)] xl:gap-6">
        {/* Mobile menu toggle */}
        <button
          className="xl:hidden shrink-0 text-2xl text-gold"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

        {/* Wordmark */}
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 select-none xl:justify-self-start"
          data-cursor-hover
        >
          {settings.logo?.url && !logoFailed ? (
            <img
              src={settings.logo.url}
              alt={settings.siteName}
              className="h-8 w-auto max-w-[9rem] shrink-0 object-contain md:h-10 md:max-w-[11rem] xl:h-11"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="font-script text-2xl md:text-3xl tracking-widest3 uppercase text-gold-sheen">
              {settings.siteName}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center justify-self-center gap-6 2xl:gap-8">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className="relative group">
              <NavLink
                to={link.to}
                data-cursor-hover
                end={link.to === '/'}
                className={({ isActive }) => navLinkClass(link.hasCategories ? isCollectionsRoute : isActive)}
              >
                {link.label}
              </NavLink>
              {link.hasCategories && categories.length > 0 && (
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-5 w-56">
                  <div className="glass border border-gold/20 p-2 shadow-glass">
                    <Link to="/shop" className="block px-3 py-2 text-xs text-gold hover:bg-gold/10">All Products</Link>
                    {categories.map((category) => (
                      <Link key={category._id} to={`/shop?category=${category.slug}`} className="block px-3 py-2 text-xs text-ivory/75 hover:bg-gold/10 hover:text-gold">
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex shrink-0 items-center justify-end gap-3 text-xl sm:gap-4 md:gap-5 xl:justify-self-end">
          <button
            aria-label="Search products"
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
            className="xl:hidden overflow-hidden glass mt-3 mx-4 rounded-sm"
          >
            <ul className="flex flex-col divide-y divide-gold/10">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block px-6 py-4 text-sm tracking-widest2 uppercase hover:text-gold ${
                        (link.hasCategories ? isCollectionsRoute : isActive) ? 'text-gold' : 'text-ivory/85'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                  {link.hasCategories && categories.map((category) => (
                    <NavLink
                      key={category._id}
                      to={`/shop?category=${category.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block px-9 py-3 text-xs text-ivory/55 hover:text-gold"
                    >
                      {category.name}
                    </NavLink>
                  ))}
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
