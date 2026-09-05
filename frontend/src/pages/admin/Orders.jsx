import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineTrash } from 'react-icons/hi';
import { StatusBadge } from '@/components/admin/StatCard';
import { TextSkeleton } from '@/components/ui/Loader';
import adminApi from '@/services/adminApi';

const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState(STATUSES.includes(params.get('status')) ? params.get('status') : 'all');
  const [deleting, setDeleting] = useState(null);

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

  const deleteOrder = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteCancelledOrder(deleting._id);
      setOrders((current) => current?.filter((order) => order._id !== deleting._id));
      toast.success('Cancelled order permanently deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete the cancelled order');
    }
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
              <th className="px-6 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!orders &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gold/5"><td className="px-6 py-4" colSpan={7}><TextSkeleton /></td></tr>
              ))}
            {orders?.map((order) => (
              <tr key={order._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
                <td className="px-6 py-3">
                  <Link to={`/admin/orders/${order._id}`} className="text-gold hover:underline">{order.orderNumber}</Link>
                </td>
                <td className="px-6 py-3 text-ivory/70">{order.user?.name}</td>
                <td className="px-6 py-3 text-ivory/50">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3">${order.total.toFixed(2)}</td>
                <td className="px-6 py-3"><p className="capitalize text-xs text-ivory/70 mb-1">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}</p><StatusBadge status={order.paymentStatus} /></td>
                <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-6 py-3 text-right">{order.status === 'cancelled' && <button onClick={() => setDeleting(order)} className="inline-flex p-2 text-ember-light hover:bg-ember/10" aria-label={`Delete cancelled order ${order.orderNumber}`} title="Permanently delete cancelled order"><HiOutlineTrash /></button>}</td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-ivory/40">No orders in this status</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-obsidian/75" role="dialog" aria-modal="true" aria-labelledby="delete-order-title">
          <div className="glass w-full max-w-md p-6 border border-ember/30 shadow-2xl">
            <h2 id="delete-order-title" className="font-display text-2xl">Delete cancelled order?</h2>
            <p className="mt-3 text-sm text-ivory/65">Are you sure you want to permanently delete this cancelled order? This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3"><button onClick={() => setDeleting(null)} className="px-4 py-2 border border-gold/25 text-xs uppercase tracking-wide text-ivory/70">Cancel</button><button onClick={deleteOrder} className="px-4 py-2 bg-ember text-white text-xs uppercase tracking-wide">Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
