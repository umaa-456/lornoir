import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiX, HiOutlinePhotograph } from 'react-icons/hi';
import adminApi from '@/services/adminApi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.listCategories().then((d) => setCategories(d.categories));
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat._id);
    setForm({ name: cat.name, description: cat.description || '' });
    setImageFile(null);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let categoryId = editing;
      if (editing) {
        await adminApi.updateCategory(editing, form);
        toast.success('Category updated');
      } else {
        const res = await adminApi.createCategory(form);
        categoryId = res.category._id;
        toast.success('Category created');
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await adminApi.uploadCategoryImage(categoryId, formData);
      }

      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (cat) => {
    if (!window.confirm(`Remove "${cat.name}"?`)) return;
    await adminApi.deleteCategory(cat._id);
    toast.success('Category removed');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-2">Taxonomy</p>
          <h1 className="heading-display text-3xl">Categories</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-3 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold">
          <HiOutlinePlus /> New Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass p-5 space-y-4 max-w-md">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gold">{editing ? 'Edit Category' : 'New Category'}</p>
            <button type="button" onClick={() => setShowForm(false)}><HiX /></button>
          </div>
          <input
            required
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
            rows={2}
          />
          <label className="flex items-center gap-2 text-xs text-ivory/50 cursor-pointer hover:text-gold">
            <HiOutlinePhotograph />
            {imageFile ? imageFile.name : 'Upload a photo for this category (shown on the homepage tiles)'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
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
              <th className="px-6 py-3 font-normal">Image</th>
              <th className="px-6 py-3 font-normal">Name</th>
              <th className="px-6 py-3 font-normal">Slug</th>
              <th className="px-6 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
                <td className="px-6 py-3">
                  {cat.image?.url ? (
                    <img src={cat.image.url} alt="" className="w-10 h-10 rounded-sm object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center text-gold/30">
                      <HiOutlinePhotograph />
                    </div>
                  )}
                </td>
                <td className="px-6 py-3">{cat.name}</td>
                <td className="px-6 py-3 text-ivory/40">{cat.slug}</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-3 text-ivory/50">
                    <button onClick={() => openEdit(cat)} className="hover:text-gold" aria-label="Edit"><HiOutlinePencil /></button>
                    <button onClick={() => remove(cat)} className="hover:text-ember-light" aria-label="Delete"><HiOutlineTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-ivory/40">No categories yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
