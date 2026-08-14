import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StatusBadge } from '@/components/admin/StatCard';
import { TextSkeleton } from '@/components/ui/Loader';
import adminApi from '@/services/adminApi';

const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState(STATUSES.includes(params.get('status')) ? params.get('status') : 'all');

  useEffect(() => {
    adminApi
      .listOrders(status === 'all' ? {} : { status })
      .then((d) => setOrders(d.orders))
      .catch(() => toast.error('Could not load orders'));
  }, [status]);

  const handleStatusChange = (s) => {
    setStatus(s);
    setParams(s === 'all' ? {} : { status: s });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Fulfillment</p>
        <h1 className="heading-display text-3xl">Orders</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-4 py-2 text-[11px] tracking-widest2 uppercase border transition-colors ${
              status === s ? 'border-gold bg-gold text-obsidian font-semibold' : 'border-gold/25 text-ivory/60 hover:border-gold/60'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="glass rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-ivory/40 border-b border-gold/10">
              <th className="px-6 py-3 font-normal">Order</th>
              <th className="px-6 py-3 font-normal">Customer</th>
              <th className="px-6 py-3 font-normal">Date</th>
              <th className="px-6 py-3 font-normal">Total</th>
              <th className="px-6 py-3 font-normal">Payment</th>
              <th className="px-6 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {!orders &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gold/5"><td className="px-6 py-4" colSpan={6}><TextSkeleton /></td></tr>
              ))}
            {orders?.map((order) => (
              <tr key={order._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
                <td className="px-6 py-3">
                  <Link to={`/admin/orders/${order._id}`} className="text-gold hover:underline">{order.orderNumber}</Link>
                </td>
                <td className="px-6 py-3 text-ivory/70">{order.user?.name}</td>
                <td className="px-6 py-3 text-ivory/50">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3">${order.total.toFixed(2)}</td>
                <td className="px-6 py-3"><StatusBadge status={order.paymentStatus} /></td>
                <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-ivory/40">No orders in this status</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
