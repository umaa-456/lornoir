import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import { TextSkeleton } from '@/components/ui/Loader';
import api from '@/services/api';

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toast.error('Could not load your orders'));
  }, []);

  return (
    <div>
      <Helmet><title>Your Orders — L'Or Noir</title></Helmet>
      <p className="text-sm text-gold mb-6">Order History</p>

      {!orders && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <TextSkeleton key={i} className="h-16 w-full" />)}
        </div>
      )}

      {orders?.length === 0 && (
        <div className="glass p-10 text-center text-ivory/50">
          <p className="mb-4">You haven't placed an order yet.</p>
          <Link to="/shop" className="text-gold underline text-sm">Browse the collection</Link>
        </div>
      )}

      <div className="space-y-3">
        {orders?.map((order) => (
          <Link
            key={order._id}
            to={`/account/orders/${order._id}`}
            className="glass p-5 flex items-center justify-between gap-4 hover:border-gold/40 border border-transparent transition-colors block"
          >
            <div>
              <p className="text-gold text-sm">{order.orderNumber}</p>
              <p className="text-xs text-ivory/40 mt-1">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-body">${order.total.toFixed(2)}</p>
              <StatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
