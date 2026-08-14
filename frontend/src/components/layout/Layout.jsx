import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgressBar from './ScrollProgressBar';
import CustomCursor from './CustomCursor';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Layout() {
  const { itemCount } = useCart();
  const { count } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col cursor-none-desktop">
      <CustomCursor />
      <ScrollProgressBar />
      <Navbar cartCount={itemCount} wishlistCount={count} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
