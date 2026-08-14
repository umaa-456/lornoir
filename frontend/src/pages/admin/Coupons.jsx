import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiX } from 'react-icons/hi';
import { StatusBadge } from '@/components/admin/StatCard';
import adminApi from '@/services/adminApi';

const emptyForm = {
  code: '',
  type: 'percent',
  value: '',
  minSubtotal: '',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = () => adminApi.listCoupons().then((d) => setCoupons(d.coupons));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon({
        ...form,
        value: Number(form.value),
        minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: new Date(form.expiresAt).toISOString(),
      });
      toast.success('Coupon created');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon');
    }
  };

  const toggleActive = async (coupon) => {
    await adminApi.updateCoupon(coupon._id, { isActive: !coupon.isActive });
    load();
  };

  const remove = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    await adminApi.deleteCoupon(coupon._id);
    toast.success('Coupon deleted');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-2">Promotions</p>
          <h1 className="heading-display text-3xl">Coupons</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2 px-5 py-3 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold">
          <HiOutlinePlus /> New Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-5 space-y-4 max-w-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gold">New Coupon</p>
            <button type="button" onClick={() => setShowForm(false)}><HiX /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="CODE" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="bg-obsidian border border-gold/25 px-4 py-2.5 text-sm">
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
            <input required type="number" placeholder="Value" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
            <input type="number" placeholder="Min. subtotal" value={form.minSubtotal} onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
            <input type="number" placeholder="Usage limit" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
            <input required type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold">Save</button>
        </form>
      )}

      <div className="glass rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-ivory/40 border-b border-gold/10">
              <th className="px-6 py-3 font-normal">Code</th>
              <th className="px-6 py-3 font-normal">Discount</th>
              <th className="px-6 py-3 font-normal">Used</th>
              <th className="px-6 py-3 font-normal">Expires</th>
              <th className="px-6 py-3 font-normal">Status</th>
              <th className="px-6 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
                <td className="px-6 py-3 text-gold">{c.code}</td>
                <td className="px-6 py-3">{c.type === 'percent' ? `${c.value}%` : `$${c.value}`}</td>
                <td className="px-6 py-3 text-ivory/60">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                <td className="px-6 py-3 text-ivory/50">{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td className="px-6 py-3">
                  <button onClick={() => toggleActive(c)}>
                    <StatusBadge status={c.isActive ? 'active' : 'inactive'} />
                  </button>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => remove(c)} className="text-ember-light hover:opacity-70" aria-label="Delete coupon">
                    <HiOutlineTrash />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-ivory/40">No coupons yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
