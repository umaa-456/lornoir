import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { TextSkeleton } from '@/components/ui/Loader';
import adminApi from '@/services/adminApi';
import { formatCurrency } from '@/utils/currency';

const FILTERS = [
  ['all', 'All Products'],
  ['configured', 'Shipping Configured'],
  ['not_configured', 'Not Configured'],
  ['free', 'Free Shipping'],
];

export default function ShippingManagement() {
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [fee, setFee] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await adminApi.listShippingProducts({ q: search || undefined, status: filter, page, limit: 20 });
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch {
      toast.error('Could not load product shipping data');
      setProducts([]);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [search, filter, page]);

  const openEditor = (product) => {
    setEditing(product);
    setFee(product.shippingFee ?? '');
  };

  const save = async (event) => {
    event.preventDefault();
    const numericFee = Number(fee);
    if (fee === '' || !Number.isFinite(numericFee) || numericFee < 0) {
      toast.error('Enter a valid shipping fee of PKR 0 or more');
      return;
    }
    setSaving(true);
    try {
      const data = await adminApi.updateProductShippingFee(editing._id, numericFee);
      setProducts((current) => current?.map((product) => product._id === data.product._id ? data.product : product));
      toast.success(`Shipping fee updated for ${data.product.name}`);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update the shipping fee');
    } finally {
      setSaving(false);
    }
  };

  const changeFilter = (value) => { setFilter(value); setPage(1); };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="eyebrow mb-2">Fulfilment</p>
        <h1 className="heading-display text-3xl">Shipping Management</h1>
        <p className="mt-2 text-sm text-ivory/50">Manage shipping charges for your products. Shipping is charged per product, per quantity.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by product name or SKU…" className="w-full bg-transparent border border-gold/25 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
        </div>
        <p className="text-xs text-ivory/45">{pagination ? `${pagination.total} product${pagination.total === 1 ? '' : 's'}` : 'Loading products…'}</p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filter product shipping">
        {FILTERS.map(([value, label]) => <button key={value} type="button" onClick={() => changeFilter(value)} className={`px-3 py-2 border text-xs transition-colors ${filter === value ? 'border-gold bg-gold text-obsidian font-semibold' : 'border-gold/25 text-ivory/60 hover:border-gold/60'}`}>{label}</button>)}
      </div>

      <div className="glass rounded-sm overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-left text-xs text-ivory/40 border-b border-gold/10"><th className="px-6 py-3 font-normal">Product</th><th className="px-6 py-3 font-normal">Price</th><th className="px-6 py-3 font-normal">Stock</th><th className="px-6 py-3 font-normal">Status</th><th className="px-6 py-3 font-normal">Shipping Fee</th><th className="px-6 py-3 font-normal text-right">Action</th></tr></thead>
          <tbody>
            {!products && Array.from({ length: 6 }).map((_, index) => <tr key={index} className="border-b border-gold/5"><td colSpan={6} className="px-6 py-4"><TextSkeleton /></td></tr>)}
            {products?.map((product) => <tr key={product._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
              <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 shrink-0 border border-gold/15 bg-obsidian-light">{product.images?.[0]?.url && <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />}</div><div><p>{product.name}</p><p className="text-xs text-ivory/40">{product.variants?.map((variant) => variant.sku).join(', ') || 'No SKU'}</p></div></div></td>
              <td className="px-6 py-3">{formatCurrency(product.basePrice)}</td>
              <td className="px-6 py-3"><span>{product.availableStock ?? 0} available</span><span className="block text-xs text-ivory/40">of {product.totalStock ?? 0} total</span></td>
              <td className="px-6 py-3"><Availability product={product} /></td>
              <td className="px-6 py-3"><Fee fee={product.shippingFee} /></td>
              <td className="px-6 py-3 text-right"><button type="button" onClick={() => openEditor(product)} className="inline-flex items-center gap-2 text-xs text-gold hover:underline"><HiOutlinePencil /> {product.shippingFee === null || product.shippingFee === undefined ? 'Set fee' : 'Edit'}</button></td>
            </tr>)}
            {products?.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-ivory/45">No products match this shipping filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {pagination?.totalPages > 1 && <div className="flex items-center justify-end gap-3 text-sm"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="px-3 py-2 border border-gold/25 disabled:opacity-35">Previous</button><span className="text-ivory/50">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="px-3 py-2 border border-gold/25 disabled:opacity-35">Next</button></div>}

      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 p-5" role="dialog" aria-modal="true" aria-labelledby="shipping-fee-title">
        <form onSubmit={save} className="glass w-full max-w-md border border-gold/25 p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow mb-2">Product Shipping</p><h2 id="shipping-fee-title" className="font-display text-2xl">{editing.name}</h2></div><button type="button" onClick={() => setEditing(null)} className="text-xl text-ivory/50 hover:text-gold" aria-label="Close"><HiOutlineX /></button></div>
          <label className="block mt-6 text-sm text-ivory/65"><span className="mb-2 block">Shipping Fee (PKR)</span><input autoFocus required type="number" min="0" step="0.01" value={fee} onChange={(event) => setFee(event.target.value)} className="admin-input" placeholder="250" /></label>
          <p className="mt-3 text-xs text-ivory/45">Use 0 for free shipping. This fee is charged once for each unit ordered.</p>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 border border-gold/25 text-xs uppercase tracking-wide">Cancel</button><button disabled={saving} className="px-4 py-2.5 bg-gold text-obsidian text-xs uppercase tracking-wide font-semibold disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button></div>
        </form>
      </div>}
    </div>
  );
}

function Fee({ fee }) {
  if (fee === null || fee === undefined) return <span className="text-ember-light">Not configured</span>;
  return fee === 0 ? <span className="text-primary">Free</span> : <span>{formatCurrency(fee)}</span>;
}

function Availability({ product }) {
  if (product.stockStatus === 'coming_soon') return <span className="text-gold">Coming Soon</span>;
  return product.stockStatus === 'out_of_stock' ? <span className="text-ember-light">Out of Stock</span> : <span className="text-primary">In Stock</span>;
}
