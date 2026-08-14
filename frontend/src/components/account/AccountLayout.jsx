import { NavLink, Outlet } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineLocationMarker,
  HiOutlineBell,
  HiOutlineHeart,
} from 'react-icons/hi';

const NAV = [
  { to: '/account', label: 'Profile', icon: HiOutlineUser, end: true },
  { to: '/account/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { to: '/account/addresses', label: 'Addresses', icon: HiOutlineLocationMarker },
  { to: '/account/notifications', label: 'Notifications', icon: HiOutlineBell },
  { to: '/wishlist', label: 'Wishlist', icon: HiOutlineHeart },
];

export default function AccountLayout() {
  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 md:px-10">
      <p className="eyebrow mb-3">Your Account</p>
      <h1 className="heading-display text-4xl mb-10">Welcome Back</h1>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                  isActive ? 'bg-gold text-obsidian font-semibold' : 'text-ivory/65 hover:bg-gold/10 hover:text-gold'
                }`
              }
            >
              <item.icon className="text-lg shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
