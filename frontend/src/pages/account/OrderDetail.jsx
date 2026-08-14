import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi';
import StatusBadge from '@/components/ui/StatusBadge';
import api from '@/services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => toast.error('Could not load order'));
  };
  useEffect(load, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`, {});
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!order) return <p className="text-ivory/50">Loading order…</p>;

  const canCancel = ['pending', 'processing'].includes(order.status);

  return (
    <div className="space-y-6">
      <Helmet><title>Order {order.orderNumber} — L'Or Noir</title></Helmet>

      <Link to="/account/orders" className="flex items-center gap-2 text-sm text-ivory/50 hover:text-gold">
        <HiArrowLeft /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-gold text-sm">{order.orderNumber}</p>
          <p className="text-xs text-ivory/40 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {order.trackingNumber && (
        <div className="glass p-4 text-sm">
          <span className="text-ivory/50">Tracking Number: </span>
          <span className="text-gold">{order.trackingNumber}</span>
        </div>
      )}

      <div className="glass rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {order.items.map((item) => (
              <tr key={item.sku} className="border-b border-gold/5 last:border-0">
                <td className="px-5 py-3">{item.name} <span className="text-ivory/40">({item.variantLabel})</span></td>
                <td className="px-5 py-3 text-ivory/50">× {item.qty}</td>
                <td className="px-5 py-3 text-right">${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass p-5">
        <p className="text-xs text-ivory/40 uppercase tracking-widest2 mb-3">Delivery Address</p>
        <p className="text-sm text-ivory/70 leading-relaxed">
          {order.shippingAddress.fullName}<br />
          {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
          {order.shippingAddress.country}
        </p>
      </div>

      <div className="flex justify-between items-center pt-2">
        <p className="font-semibold">Total: <span className="text-gold">${order.total.toFixed(2)}</span></p>
        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling} className="text-xs text-ember-light hover:underline disabled:opacity-50">
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  );
}
