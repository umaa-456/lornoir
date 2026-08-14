import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineStar, HiX } from 'react-icons/hi';
import api from '@/services/api';

const empty = { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '' };

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/addresses').then(({ data }) => setAddresses(data.addresses)).catch(() => toast.error('Could not load addresses'));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/addresses', form);
      toast.success('Address saved');
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (addr) => {
    await api.patch(`/addresses/${addr._id}`, { isDefault: true });
    load();
  };

  const remove = async (addr) => {
    if (!window.confirm('Remove this address?')) return;
    await api.delete(`/addresses/${addr._id}`);
    toast.success('Address removed');
    load();
  };

  return (
    <div>
      <Helmet><title>Your Addresses — L'Or Noir</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gold">Saved Addresses</p>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 text-xs text-gold hover:underline">
          <HiOutlinePlus /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-5 space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-ivory/70">New Address</p>
            <button type="button" onClick={() => setShowForm(false)}><HiX /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
          </div>
          <input required placeholder="Address line 1" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
          <input placeholder="Address line 2 (optional)" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
          <div className="grid sm:grid-cols-3 gap-3">
            <input required placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
            <input required placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
            <input required placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} className="bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
          </div>
          <input required placeholder="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm" />
          <button disabled={saving} className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Address'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr._id} className="glass p-5 flex items-start justify-between gap-4">
            <div className="text-sm text-ivory/70 leading-relaxed">
              <p className="text-ivory flex items-center gap-2">
                {addr.fullName}
                {addr.isDefault && <span className="text-[10px] uppercase text-gold border border-gold/40 px-1.5 py-0.5 rounded-full">Default</span>}
              </p>
              <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
              <p>{addr.country}</p>
              <p className="text-ivory/40 mt-1">{addr.phone}</p>
            </div>
            <div className="flex flex-col gap-3 text-ivory/40 shrink-0">
              {!addr.isDefault && (
                <button onClick={() => makeDefault(addr)} aria-label="Make default" className="hover:text-gold"><HiOutlineStar /></button>
              )}
              <button onClick={() => remove(addr)} aria-label="Delete address" className="hover:text-ember-light"><HiOutlineTrash /></button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && !showForm && (
          <p className="text-ivory/40 text-sm">No saved addresses yet.</p>
        )}
      </div>
    </div>
  );
}
