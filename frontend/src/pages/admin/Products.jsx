import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import { TextSkeleton } from '@/components/ui/Loader';
import adminApi from '@/services/adminApi';

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    adminApi
      .listProducts({ q: search || undefined, limit: 48 })
      .then((data) => setProducts(data.products))
      .catch(() => toast.error('Could not load products'));
  };

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the catalogue?`)) return;
    try {
      await adminApi.deleteProduct(product._id);
      toast.success('Product removed');
      load();
    } catch {
      toast.error('Could not remove product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Catalogue</p>
          <h1 className="heading-display text-3xl">Products</h1>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 px-5 py-3 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold"
        >
          <HiOutlinePlus /> New Product
        </Link>
      </div>

      <div className="relative max-w-sm">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-transparent border border-gold/25 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold"
        />
      </div>

      <div className="glass rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-ivory/40 border-b border-gold/10">
              <th className="px-6 py-3 font-normal">Product</th>
              <th className="px-6 py-3 font-normal">Brand</th>
              <th className="px-6 py-3 font-normal">Price</th>
              <th className="px-6 py-3 font-normal">Stock</th>
              <th className="px-6 py-3 font-normal">Rating</th>
              <th className="px-6 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!products &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gold/5">
                  <td className="px-6 py-4" colSpan={6}><TextSkeleton /></td>
                </tr>
              ))}
            {products?.map((p) => (
              <tr key={p._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
                <td className="px-6 py-3">{p.name}</td>
                <td className="px-6 py-3 text-ivory/60">{p.brand?.name}</td>
                <td className="px-6 py-3">${p.basePrice}</td>
                <td className="px-6 py-3">{p.totalStock ?? '—'}</td>
                <td className="px-6 py-3 text-gold">{p.rating}★</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-3 text-ivory/50">
                    <Link to={`/admin/products/${p._id}`} className="hover:text-gold" aria-label="Edit product">
                      <HiOutlinePencil />
                    </Link>
                    <button onClick={() => handleDelete(p)} className="hover:text-ember-light" aria-label="Delete product">
                      <HiOutlineTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-ivory/40">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
