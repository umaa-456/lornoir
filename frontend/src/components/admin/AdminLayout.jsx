import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  HiOutlineViewGrid,
  HiOutlineShoppingBag,
  HiOutlineClipboardList,
  HiOutlineTag,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineTicket,
  HiOutlineExclamationCircle,
  HiOutlinePhotograph,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: HiOutlineShoppingBag },
  { to: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { to: '/admin/categories', label: 'Categories', icon: HiOutlineTag },
  { to: '/admin/brands', label: 'Maisons', icon: HiOutlineOfficeBuilding },
  { to: '/admin/customers', label: 'Customers & Staff', icon: HiOutlineUsers },
  { to: '/admin/reviews', label: 'Reviews', icon: HiOutlineStar },
  { to: '/admin/coupons', label: 'Coupons', icon: HiOutlineTicket },
  { to: '/admin/inventory', label: 'Inventory', icon: HiOutlineExclamationCircle },
  { to: '/admin/branding', label: 'Branding & Content', icon: HiOutlinePhotograph },
  { to: '/admin/settings', label: 'Settings', icon: HiOutlineCog },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-obsidian-light border-r border-gold/10 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-6 py-7 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            {settings.logo?.url ? (
              <img src={settings.logo.url} alt={settings.siteName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-script text-xl tracking-widest3 uppercase text-gold-sheen">{settings.siteName}</span>
            )}
          </Link>
          <button className="lg:hidden text-xl" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <HiOutlineX />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  isActive ? 'bg-gold text-obsidian font-semibold' : 'text-ivory/65 hover:bg-gold/10 hover:text-gold'
                }`
              }
            >
              <item.icon className="text-lg shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gold/10 space-y-2">
          <Link to="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs text-ivory/50 hover:text-gold">
            <HiOutlineExternalLink /> View storefront
          </Link>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-xs text-ivory/50 hover:text-gold w-full">
            <HiOutlineLogout /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-obsidian/70 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gold/10 sticky top-0 bg-obsidian/90 backdrop-blur-sm z-20">
          <button className="lg:hidden text-xl" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <HiOutlineMenu />
          </button>
          <p className="hidden lg:block text-sm text-ivory/50">Administration Console</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block text-sm">
              <p className="leading-tight">{user?.name}</p>
              <p className="text-xs text-ivory/40 capitalize leading-tight">{user?.role}</p>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
