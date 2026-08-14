import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineTicket } from 'react-icons/hi';
import Reveal from '@/components/ui/Reveal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Cart() {
  const {
    items,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    updateQty,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    // Demo coupons available without a live backend: WELCOME10, GOLD20
    const demo = {
      WELCOME10: { code: 'WELCOME10', type: 'percent', value: 10 },
      GOLD20: { code: 'GOLD20', type: 'fixed', value: 20 },
    }[couponCode.trim().toUpperCase()];

    if (demo) applyCoupon(demo);
    else toast.error('That coupon code is not valid');
    setApplying(false);
    setCouponCode('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-10">
      <Helmet><title>Your Bag — L'Or Noir</title></Helmet>

      <Reveal className="mb-12">
        <p className="eyebrow mb-3">Your Selection</p>
        <h1 className="heading-display text-4xl md:text-5xl">Shopping Bag</h1>
      </Reveal>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-2xl mb-4">Your bag is empty.</p>
          <Link to="/shop" className="text-gold underline text-sm">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-12">
          <div className="divide-y divide-gold/10">
            {items.map((item) => (
              <div key={item.lineId} className="flex gap-5 py-6 first:pt-0">
                <div
                  className="w-24 h-24 rounded-sm shrink-0"
                  style={{
                    background: item.image
                      ? `url(${item.image}) center/cover no-repeat`
                      : 'linear-gradient(155deg,#1a1512,#B84E12)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg">{item.name}</p>
                      {item.variant && <p className="text-xs text-ivory/40 mt-1">{item.variant}</p>}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.lineId)}
                      aria-label="Remove item"
                      className="text-ivory/40 hover:text-ember-light shrink-0"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gold/25">
                      <button
                        onClick={() => updateQty(item.lineId, item.qty - 1)}
                        className="w-8 h-9 text-lg hover:text-gold"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.lineId, item.qty + 1)}
                        className="w-8 h-9 text-lg hover:text-gold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-body">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass p-6 h-fit space-y-5">
            <p className="text-sm text-gold">Order Summary</p>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <HiOutlineTicket className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40 text-sm" />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full bg-transparent border border-gold/25 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-gold placeholder:text-ivory/30"
                />
              </div>
              <button
                type="submit"
                disabled={applying}
                className="px-4 py-2 border border-gold/40 text-xs uppercase tracking-wide text-gold hover:bg-gold hover:text-obsidian transition-colors"
              >
                Apply
              </button>
            </form>
            {coupon?.code && (
              <div className="flex items-center justify-between text-xs bg-gold/10 px-3 py-2">
                <span className="text-gold">{coupon.code} applied</span>
                <button onClick={removeCoupon} className="text-ivory/50 hover:text-ember-light">Remove</button>
              </div>
            )}

            <div className="space-y-2 text-sm border-t border-gold/10 pt-5">
              <SummaryLine label="Subtotal" value={subtotal} />
              {discount > 0 && <SummaryLine label="Discount" value={-discount} />}
              <SummaryLine label="Shipping" value={shipping} freeLabel={shipping === 0} />
              <div className="border-t border-gold/10 pt-3 mt-3">
                <SummaryLine label="Total" value={total} bold />
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold hover:bg-gold-pale transition-colors"
            >
              Proceed to Checkout
            </button>
            <p className="text-[11px] text-ivory/40 text-center">Free shipping on orders over $150</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryLine({ label, value, bold, freeLabel }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-base' : 'text-ivory/60'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-gold' : ''}>
        {freeLabel ? 'Free' : `${value < 0 ? '−' : ''}$${Math.abs(value).toFixed(2)}`}
      </span>
    </div>
  );
}
