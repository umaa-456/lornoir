import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import adminApi from '@/services/adminApi';

export default function AdminInventory() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    adminApi
      .getLowStock()
      .then((d) => setProducts(d.products))
      .catch(() => toast.error('Could not load inventory'));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Stock Health</p>
        <h1 className="heading-display text-3xl">Low Stock Alerts</h1>
      </div>

      {!products && <p className="text-ivory/50">Loading…</p>}

      {products?.length === 0 && (
        <div className="glass p-10 text-center text-ivory/50">
          Everything is well stocked — no alerts right now.
        </div>
      )}

      <div className="space-y-3">
        {products?.map((product) => (
          <div key={product._id} className="glass p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HiOutlineExclamationCircle className="text-gold text-xl shrink-0" />
              <div>
                <Link to={`/admin/products/${product._id}`} className="hover:text-gold">{product.name}</Link>
                <p className="text-xs text-ivory/40">{product.brand?.name}</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              {product.variants
                .filter((v) => v.stock > 0 && v.stock <= product.lowStockThreshold)
                .map((v) => (
                  <span key={v.sku} className="px-2.5 py-1 bg-ember/15 text-ember-light rounded-full">
                    {v.label}: {v.stock} left
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
