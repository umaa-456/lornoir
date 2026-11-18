import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiOutlineHeart, HiOutlineEye, HiStar } from 'react-icons/hi';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { placeholderSwatch, productImage } from '@/utils/placeholderSwatch';
import QuickViewModal from './QuickViewModal';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatCurrency } from '@/utils/currency';
import { getSalePrice, isOnActiveSale } from '@/utils/salePricing';

export default function ProductCard({ product }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product._id);

  const image = productImage(product);
  const defaultVariant = product.variants?.[0];
  const regularPrice = defaultVariant?.price ?? product.basePrice;
  const onSale = isOnActiveSale(product);
  const price = getSalePrice(product, regularPrice);
  const availability = product.stockStatus || 'in_stock';
  const unavailable = availability !== 'in_stock';

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -8, ry: px * 8 });
  };

  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  const handleQuickAdd = () => {
    if (product.variants?.length > 1) {
      navigate(`/product/${product.slug}`);
      return;
    }
    if (!defaultVariant) return;
    addToCart(product, defaultVariant, 1);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white p-3 shadow-[0_8px_28px_-18px_rgba(18,60,53,0.35)] transition-[border-color,box-shadow] duration-300 hover:border-gold/70 hover:shadow-[0_22px_45px_-22px_rgba(18,60,53,0.45)] sm:p-4"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 900 }}
          className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#F7F5F0]"
        >
          <motion.div
            animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              transformStyle: 'preserve-3d',
              background: image ? 'linear-gradient(145deg, #fbfaf7, #f0ede5)' : placeholderSwatch(product.name),
            }}
            className="w-full h-full flex items-center justify-center"
          >
            {image ? (
              <img
                src={image}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.06] sm:p-4"
              />
            ) : (
              <svg viewBox="0 0 100 170" className="w-16 opacity-90" style={{ transform: 'translateZ(40px)' }} aria-hidden="true">
                <rect x="35" y="10" width="30" height="18" rx="2" fill="#171A18" opacity="0.55" />
                <path
                  d="M28 28 Q28 46 24 60 L24 150 Q24 160 34 160 L66 160 Q76 160 76 150 L76 60 Q72 46 72 28 Z"
                  fill="#171A18"
                  opacity="0.45"
                />
              </svg>
            )}

            {onSale && (
              <span className="absolute top-2.5 left-2.5 z-10 rounded-md border border-white/20 bg-rose-700/90 px-2.5 py-1 text-[10px] font-bold leading-none tracking-wide text-white shadow-lg shadow-black/30 backdrop-blur-[1px]">
                {product.activeSale.discount}% OFF
              </span>
            )}
            {product.tags?.includes('new') && !onSale && (
              <span className="absolute top-3 left-3 bg-gold text-obsidian text-[10px] tracking-widest2 uppercase px-2 py-1 font-semibold">
                New
              </span>
            )}
            {unavailable && (
              <span className="absolute top-3 left-3 bg-charcoal text-white text-[10px] tracking-widest2 uppercase px-2 py-1 border border-gold/50">
                {availability === 'coming_soon' ? 'Coming Soon' : 'Out of Stock'}
              </span>
            )}
          </motion.div>

          {/* Hover actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              data-cursor-hover
              onClick={() => toggleWishlist(product)}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-gold hover:bg-gold hover:text-obsidian transition-colors"
            >
              {wishlisted ? <HiHeart /> : <HiOutlineHeart />}
            </button>
            <button
              aria-label="Quick view"
              data-cursor-hover
              onClick={() => setQuickViewOpen(true)}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-gold hover:bg-gold hover:text-obsidian transition-colors"
            >
              <HiOutlineEye />
            </button>
          </div>

          {/* Add to cart slide-up */}
          <button
            data-cursor-hover
            onClick={handleQuickAdd}
            disabled={!defaultVariant || unavailable || (product.variants?.length <= 1 && defaultVariant.stock === 0)}
            className="absolute bottom-0 left-0 right-0 translate-y-0 bg-primary/95 py-3 text-[11px] uppercase tracking-widest2 text-white backdrop-blur-sm transition-transform duration-300 hover:bg-gold hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 sm:translate-y-full sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0"
          >
            {unavailable ? (availability === 'coming_soon' ? 'Coming Soon' : 'Out of Stock') : product.variants?.length > 1 ? 'Select Design' : defaultVariant?.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
          </button>
        </div>

        <Link to={`/product/${product.slug}`} data-cursor-hover className="mt-4 block flex-1">
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-primary/55">{product.brand?.name || 'Lornoir Collection'}</p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[3.25rem] font-display text-base leading-snug text-primary transition-colors group-hover:text-[#9A7130] sm:text-lg">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-gold text-xs">
              <HiStar /> {product.rating?.toFixed?.(1) ?? product.rating ?? '—'}
            </span>
            <span className="text-xs text-ivory/40">({product.reviewCount ?? 0})</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-primary/10 pt-3">
            {onSale && (
              <span className="font-body text-xs text-ivory/40 line-through">{formatCurrency(regularPrice, settings.currency)}</span>
            )}
            <span className={`font-body text-base font-bold ${onSale ? 'text-rose-700' : 'text-primary'}`}>{formatCurrency(price, settings.currency)}</span>
            {onSale && <span className="text-[10px] tracking-wide text-ember-light">{product.activeSale.discount}% OFF</span>}
          </div>
        </Link>
      </motion.div>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
