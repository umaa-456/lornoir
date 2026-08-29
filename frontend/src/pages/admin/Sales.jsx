import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineSearch } from 'react-icons/hi';
import adminApi from '@/services/adminApi';

const blank = { title: '', description: '', occasion: '', discount: '', startsAt: '', endsAt: '', enabled: true, products: [] };
const toLocal = (date) => {
  if (!date) return '';
  const value = new Date(date);
  const pad = (number) => String(number).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};
const isActive = (sale) => sale.enabled && new Date(sale.startsAt) <= new Date() && new Date(sale.endsAt) >= new Date();

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [salesData, productsData] = await Promise.all([adminApi.listSales(), adminApi.listSaleProducts()]);
      setSales(Array.isArray(salesData.sales) ? salesData.sales : []);
      setProducts(Array.isArray(productsData.products) ? productsData.products : []);
    } catch {
      toast.error('Could not load sale management data');
    }
  };
  useEffect(() => { load(); }, []);

  const visibleProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const toggleProduct = (id) => setForm((current) => ({ ...current, products: current.products.includes(id) ? current.products.filter((value) => value !== id) : [...current.products, id] }));
  const reset = () => { setEditing(null); setForm(blank); setQuery(''); };

  const save = async (event) => {
    event.preventDefault();
    if (!form.products.length) return toast.error('Select at least one product');
    setSaving(true);
    try {
      const payload = { ...form, discount: Number(form.discount), products: [...new Set(form.products)], startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() };
      if (editing) await adminApi.updateSale(editing, payload); else await adminApi.createSale(payload);
      toast.success(editing ? 'Sale updated' : 'Sale created');
      reset();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save sale');
    } finally { setSaving(false); }
  };

  const edit = (sale) => {
    setEditing(sale._id);
    setForm({ title: sale.title || '', description: sale.description || '', occasion: sale.occasion || '', discount: sale.discount ?? '', startsAt: toLocal(sale.startsAt), endsAt: toLocal(sale.endsAt), enabled: Boolean(sale.enabled), products: (sale.products || []).map((product) => typeof product === 'string' ? product : product._id) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleEnabled = async (sale) => {
    try { await adminApi.updateSale(sale._id, { enabled: !sale.enabled }); toast.success(`Sale ${sale.enabled ? 'disabled' : 'enabled'}`); load(); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not update sale'); }
  };

  return <div className="max-w-6xl space-y-8">
    <div><p className="eyebrow mb-2">Campaigns</p><h1 className="heading-display text-3xl">Sale Management</h1><p className="mt-2 text-sm text-ivory/50">Create time-bound campaigns and choose exactly which products receive each discount.</p></div>
    <form onSubmit={save} className="glass p-5 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl">{editing ? 'Edit Sale' : 'Create Sale'}</h2><label className="flex items-center gap-2 text-sm text-ivory/70"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} className="accent-gold"/> Enabled</label></div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Sale Title"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="admin-input" placeholder="Eid Sale 2026" /></Field>
        <Field label="Discount"><div className="relative"><input required type="number" min="0.01" max="100" step="0.01" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} className="admin-input pr-10" placeholder="10" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/50">%</span></div></Field>
        <Field label="Reason / Occasion"><input value={form.occasion} onChange={(event) => setForm({ ...form, occasion: event.target.value })} className="admin-input" placeholder="Eid collection" /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Start"><input required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className="admin-input" /></Field><Field label="End"><input required type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} className="admin-input" /></Field></div>
        <Field label="Description" className="md:col-span-2"><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="admin-input resize-y" placeholder="Optional campaign details" /></Field>
      </div>
      <section className="border border-gold/20 p-4 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-gold">Products Included in Sale</p><p className="text-xs text-ivory/45 mt-1">{form.products.length} selected</p></div><div className="flex gap-3 text-xs"><button type="button" onClick={() => setForm((current) => ({ ...current, products: visibleProducts.map((product) => product._id) }))} className="text-gold hover:underline">Select visible</button><button type="button" onClick={() => setForm((current) => ({ ...current, products: [] }))} className="text-ivory/60 hover:text-gold">Clear all</button></div></div>
        <div className="relative"><HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40"/><input value={query} onChange={(event) => setQuery(event.target.value)} className="admin-input pl-10" placeholder="Search products..." /></div>
        <div className="max-h-64 overflow-y-auto divide-y divide-gold/10 border border-gold/10">{visibleProducts.map((product) => <label key={product._id} className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-gold/5"><input type="checkbox" checked={form.products.includes(product._id)} onChange={() => toggleProduct(product._id)} className="accent-gold"/><span className="flex-1 text-sm">{product.name}</span><span className="text-xs text-ivory/40">{product.variants?.length || 0} variants</span></label>)}{visibleProducts.length === 0 && <p className="px-3 py-6 text-center text-sm text-ivory/45">No products found.</p>}</div>
      </section>
      <div className="flex flex-wrap gap-3"><button disabled={saving} className="px-6 py-3 bg-gold text-obsidian text-xs uppercase tracking-widest2 font-semibold disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update Sale' : 'Create Sale'}</button>{editing && <button type="button" onClick={reset} className="px-6 py-3 border border-gold/25 text-xs uppercase tracking-widest2">Cancel</button>}</div>
    </form>
    <section className="space-y-3"><div><p className="eyebrow mb-2">Campaign Library</p><h2 className="font-display text-2xl">Existing Sales</h2></div>{sales.map((sale) => <article key={sale._id} className="glass p-4 sm:p-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-display text-xl">{sale.title}</h3><span className={`text-[10px] uppercase tracking-widest2 px-2 py-1 ${isActive(sale) ? 'bg-gold text-obsidian' : 'border border-gold/25 text-ivory/55'}`}>{isActive(sale) ? 'Active' : sale.enabled ? 'Scheduled / Ended' : 'Disabled'}</span></div><p className="mt-1 text-sm text-ivory/55">{sale.occasion || 'No occasion'} · {sale.discount}% off · {(sale.products || []).length} products</p><p className="mt-1 text-xs text-ivory/40">{new Date(sale.startsAt).toLocaleString()} — {new Date(sale.endsAt).toLocaleString()}</p></div><div className="flex flex-wrap gap-4 text-xs"><button onClick={() => edit(sale)} className="text-gold hover:underline">Edit</button><button onClick={() => toggleEnabled(sale)} className="text-gold hover:underline">{sale.enabled ? 'Disable' : 'Enable'}</button><button onClick={async () => { if (window.confirm(`Delete “${sale.title}”? This will only remove the campaign, not its products.`)) { try { await adminApi.deleteSale(sale._id); toast.success('Sale deleted'); load(); } catch { toast.error('Could not delete sale'); } } }} className="text-ember-light hover:underline">Delete</button></div></article>)}{sales.length === 0 && <div className="glass p-8 text-center text-ivory/45">No sales have been created yet.</div>}</section>
  </div>;
}

function Field({ label, className = '', children }) { return <label className={`block text-sm text-ivory/60 ${className}`}><span className="block mb-2">{label}</span>{children}</label>; }
