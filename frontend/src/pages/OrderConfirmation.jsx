import { useLocation, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiCheckCircle } from 'react-icons/hi';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="pt-40 pb-24 max-w-2xl mx-auto px-6 text-center">
      <Helmet><title>Order Confirmed — L'Or Noir</title></Helmet>

      <HiCheckCircle className="text-gold text-6xl mx-auto mb-6" />
      <p className="eyebrow mb-3">Thank You</p>
      <h1 className="heading-display text-4xl mb-4">Your order is confirmed.</h1>
      <p className="text-ivory/60 mb-10">
        Order <span className="text-gold">#{order.orderNumber}</span> has been received and is
        being prepared. A confirmation email is on its way to you.
      </p>

      <div className="glass p-6 text-left mb-10">
        <p className="text-xs text-ivory/40 uppercase tracking-widest2 mb-4">Order Summary</p>
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.sku} className="flex justify-between text-sm text-ivory/70">
              <span>{item.name} ({item.variantLabel}) × {item.qty}</span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gold/10 pt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-gold">${order.total.toFixed(2)}</span>
        </div>
      </div>

      <Link
        to="/shop"
        className="inline-block px-9 py-4 text-xs tracking-widest2 uppercase border border-gold/40 text-ivory/80 hover:border-gold hover:text-gold transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
