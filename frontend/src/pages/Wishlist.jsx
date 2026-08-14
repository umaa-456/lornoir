import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { placeholderSwatch, productImage } from '@/utils/placeholderSwatch';

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const moveToCart = (product) => {
    const variant = product.variants?.[0];
    addToCart(product, variant, 1);
    removeFromWishlist(product._id);
  };

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-10">
      <Helmet><title>Your Wishlist — L'Or Noir</title></Helmet>

      <p className="eyebrow mb-3">Saved for Later</p>
      <h1 className="heading-display text-4xl md:text-5xl mb-12">Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-2xl mb-4">Your wishlist is empty.</p>
          <Link to="/shop" className="text-gold underline text-sm">Browse the collection</Link>
        </div>
      ) : (
        <div className="divide-y divide-gold/10">
          {items.map((product) => {
            const image = productImage(product);
            const price = product.variants?.[0]?.price ?? product.basePrice;
            return (
              <div key={product._id} className="flex items-center gap-5 py-6 first:pt-0">
                <div
                  className="w-20 h-20 rounded-sm shrink-0"
                  style={{ background: image ? `url(${image}) center/cover no-repeat` : placeholderSwatch(product.name) }}
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.slug}`} className="hover:text-gold">
                    <p className="text-[11px] tracking-widest2 uppercase text-gold/70">{product.brand?.name}</p>
                    <p className="font-display text-lg">{product.name}</p>
                  </Link>
                  <p className="text-sm text-ivory/50 mt-1">${price}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => moveToCart(product)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gold/30 text-xs uppercase tracking-wide text-gold hover:bg-gold hover:text-obsidian transition-colors"
                  >
                    <HiOutlineShoppingBag /> Move to Bag
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    aria-label="Remove from wishlist"
                    className="text-ivory/40 hover:text-ember-light"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
