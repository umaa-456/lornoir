import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi';
import { StatusBadge } from '@/components/admin/StatCard';
import adminApi from '@/services/adminApi';

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminApi.getOrder(id).then((d) => {
      setOrder(d.order);
      setTracking(d.order.trackingNumber || '');
    });
  };

  useEffect(load, [id]);

  const updateStatus = async (status) => {
    setSaving(true);
    try {
      const d = await adminApi.updateOrderStatus(id, { status, trackingNumber: tracking || undefined });
      setOrder(d.order);
      toast.success(`Order marked ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!window.confirm('Refund this order? This cannot be undone.')) return;
    try {
      const d = await adminApi.refundOrder(id, {});
      setOrder(d.order);
      toast.success('Order refunded');
    } catch {
      toast.error('Could not process refund');
    }
  };

  if (!order) return <p className="text-ivory/50">Loading order…</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <Link to="/admin/orders" className="flex items-center gap-2 text-sm text-ivory/50 hover:text-gold">
        <HiArrowLeft /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-display text-3xl">{order.orderNumber}</h1>
          <p className="text-ivory/50 text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-5 rounded-sm">
          <p className="text-xs text-ivory/40 uppercase tracking-widest2 mb-3">Shipping Address</p>
          <AddressBlock addr={order.shippingAddress} />
        </div>
        <div className="glass p-5 rounded-sm">
          <p className="text-xs text-ivory/40 uppercase tracking-widest2 mb-3">Billing Address</p>
          <AddressBlock addr={order.billingAddress} />
        </div>
      </div>

      <div className="glass rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ivory/40 border-b border-gold/10">
              <th className="px-6 py-3 font-normal">Item</th>
              <th className="px-6 py-3 font-normal">Qty</th>
              <th className="px-6 py-3 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.sku} className="border-b border-gold/5 last:border-0">
                <td className="px-6 py-3">{item.name} <span className="text-ivory/40">({item.variantLabel})</span></td>
                <td className="px-6 py-3">{item.qty}</td>
                <td className="px-6 py-3 text-right">${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-sm">
            <SummaryRow label="Subtotal" value={order.subtotal} />
            {order.discount > 0 && <SummaryRow label="Discount" value={-order.discount} />}
            <SummaryRow label="Shipping" value={order.shippingCost} />
            <SummaryRow label="Total" value={order.total} bold />
          </tfoot>
        </table>
      </div>

      <div className="glass p-5 rounded-sm space-y-4">
        <p className="text-xs text-ivory/40 uppercase tracking-widest2">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              disabled={saving}
              onClick={() => updateStatus(s)}
              className={`px-4 py-2 text-xs uppercase border transition-colors disabled:opacity-40 ${
                order.status === s ? 'bg-gold text-obsidian border-gold font-semibold' : 'border-gold/25 text-ivory/60 hover:border-gold/60'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            disabled={saving}
            onClick={() => updateStatus('cancelled')}
            className="px-4 py-2 text-xs uppercase border border-ember/40 text-ember-light hover:bg-ember/10"
          >
            Cancel
          </button>
        </div>

        <div className="flex gap-3 items-end max-w-sm">
          <div className="flex-1">
            <label className="block text-[11px] tracking-widest2 uppercase text-ivory/50 mb-2">Tracking Number</label>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full bg-transparent border border-gold/25 px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />
          </div>
          <button
            onClick={() => updateStatus(order.status)}
            className="px-4 py-2 border border-gold/25 text-xs uppercase text-ivory/70 hover:border-gold hover:text-gold"
          >
            Save
          </button>
        </div>

        {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
          <button onClick={handleRefund} className="text-xs text-ember-light hover:underline">
            Issue full refund
          </button>
        )}
      </div>
    </div>
  );
}

function AddressBlock({ addr }) {
  return (
    <div className="text-sm text-ivory/70 leading-relaxed">
      <p>{addr.fullName}</p>
      <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
      <p>{addr.city}, {addr.state} {addr.postalCode}</p>
      <p>{addr.country}</p>
      <p className="text-ivory/50 mt-1">{addr.phone}</p>
    </div>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <tr>
      <td colSpan={2} className={`px-6 py-2 text-right ${bold ? 'font-semibold' : 'text-ivory/60'}`}>{label}</td>
      <td className={`px-6 py-2 text-right ${bold ? 'font-semibold text-gold' : ''}`}>
        {value < 0 ? '−' : ''}${Math.abs(value).toFixed(2)}
      </td>
    </tr>
  );
}
