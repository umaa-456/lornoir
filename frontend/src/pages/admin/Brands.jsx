import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiX, HiOutlinePhotograph } from 'react-icons/hi';
import adminApi from '@/services/adminApi';

const TIERS = ['House', 'Contemporary', 'Oud Specialist', 'Niche'];

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', tier: 'House', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.listBrands().then((d) => setBrands(d.brands));
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', tier: 'House', description: '' });
    setLogoFile(null);
    setShowForm(true);
  };

  const openEdit = (brand) => {
    setEditing(brand._id);
    setForm({ name: brand.name, tier: brand.tier, description: brand.description || '' });
    setLogoFile(null);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let brandId = editing;
      if (editing) {
        await adminApi.updateBrand(editing, form);
        toast.success('Maison updated');
      } else {
        const res = await adminApi.createBrand(form);
        brandId = res.brand._id;
        toast.success('Maison created');
      }

      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        await adminApi.uploadBrandLogo(brandId, formData);
      }

      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save maison');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (brand) => {
    if (!window.confirm(`Remove "${brand.name}"?`)) return;
    await adminApi.deleteBrand(brand._id);
    toast.success('Maison removed');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-2">Taxonomy</p>
          <h1 className="heading-display text-3xl">Maisons</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-3 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold">
          <HiOutlinePlus /> New Maison
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-5 space-y-4 max-w-md">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gold">{editing ? 'Edit Maison' : 'New Maison'}</p>
            <button type="button" onClick={() => setShowForm(false)}><HiX /></button>
          </div>
          <input
            required
            placeholder="Maison name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <select
            value={form.tier}
            onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
            className="w-full bg-obsidian border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          >
            {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
            rows={2}
          />
          <label className="flex items-center gap-2 text-xs text-ivory/50 cursor-pointer hover:text-gold">
            <HiOutlinePhotograph />
            {logoFile ? logoFile.name : 'Upload a logo (optional)'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setLogoFile(e.target.files[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      <div className="glass rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ivory/40 border-b border-gold/10">
              <th className="px-6 py-3 font-normal">Logo</th>
              <th className="px-6 py-3 font-normal">Name</th>
              <th className="px-6 py-3 font-normal">Tier</th>
              <th className="px-6 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
                <td className="px-6 py-3">
                  {brand.logo?.url ? (
                    <img src={brand.logo.url} alt="" className="w-10 h-10 rounded-sm object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center text-gold/30">
                      <HiOutlinePhotograph />
                    </div>
                  )}
                </td>
                <td className="px-6 py-3">{brand.name}</td>
                <td className="px-6 py-3 text-ivory/40">{brand.tier}</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-3 text-ivory/50">
                    <button onClick={() => openEdit(brand)} className="hover:text-gold" aria-label="Edit"><HiOutlinePencil /></button>
                    <button onClick={() => remove(brand)} className="hover:text-ember-light" aria-label="Delete"><HiOutlineTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-ivory/40">No maisons yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
