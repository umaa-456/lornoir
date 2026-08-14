import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiArrowLeft } from 'react-icons/hi';
import FormField, { inputClass } from '@/components/ui/FormField';
import adminApi from '@/services/adminApi';
import api from '@/services/api';

const TAGS = ['new', 'bestseller', 'trending', 'featured', 'flash-sale', 'gift-sets'];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      brandName: '',
      categoryName: '',
      description: '',
      notes: { top: '', heart: '', base: '' },
      tags: [],
      variants: [{ label: '50ml', sku: '', price: '', compareAtPrice: '', stock: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  const loadTaxonomy = () => {
    adminApi.listBrands().then((d) => setBrands(d.brands));
    adminApi.listCategories().then((d) => setCategories(d.categories));
  };

  useEffect(() => {
    loadTaxonomy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      reset({
        name: p.name,
        brandName: p.brand?.name || '',
        categoryName: p.category?.name || '',
        description: p.description,
        notes: p.notes,
        tags: p.tags,
        variants: p.variants,
      });
      setProductImages(p.images || []);
    });
  }, [id, isEdit, reset]);

  /** Finds an existing brand/category by (case-insensitive) name, or
   * creates a new one on the fly — this is what lets the admin just type
   * a name instead of being blocked on a pre-populated dropdown. */
  const resolveByName = async (typedName, list, createFn) => {
    const trimmed = typedName.trim();
    const existing = list.find((item) => item.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing._id;
    const created = await createFn({ name: trimmed });
    return created;
  };

  const onSubmit = async (data) => {
    // Catch the most common cause of "validation failed" up front: an
    // empty or non-numeric price/stock field on a variant row, which
    // becomes NaN and fails Mongoose's schema validation server-side.
    for (const [i, v] of data.variants.entries()) {
      if (!v.label?.trim() || !v.sku?.trim()) {
        toast.error(`Variant ${i + 1}: label and SKU are required`);
        return;
      }
      if (v.price === '' || Number.isNaN(Number(v.price)) || Number(v.price) < 0) {
        toast.error(`Variant ${i + 1}: enter a valid price`);
        return;
      }
      if (v.stock === '' || Number.isNaN(Number(v.stock)) || Number(v.stock) < 0) {
        toast.error(`Variant ${i + 1}: enter a valid stock quantity`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const [brandId, categoryId] = await Promise.all([
        resolveByName(data.brandName, brands, async (payload) => {
          const res = await adminApi.createBrand(payload);
          return res.brand._id;
        }),
        resolveByName(data.categoryName, categories, async (payload) => {
          const res = await adminApi.createCategory(payload);
          return res.category._id;
        }),
      ]);

      const payload = {
        name: data.name,
        brand: brandId,
        category: categoryId,
        description: data.description,
        notes: data.notes,
        tags: data.tags,
        variants: data.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          stock: Number(v.stock),
        })),
      };

      let productId = id;
      if (isEdit) {
        await adminApi.updateProduct(id, payload);
      } else {
        const res = await adminApi.createProduct(payload);
        productId = res.product._id;
      }

      // The product is already saved at this point. If the image upload
      // fails (e.g. Cloudinary isn't configured yet), that should show as
      // its own warning — not make it look like the whole product was lost.
      if (newImages.length > 0) {
        try {
          const formData = new FormData();
          newImages.forEach((file) => formData.append('images', file));
          await adminApi.uploadProductImages(productId, formData);
        } catch (imgErr) {
          toast.error(
            imgErr.response?.data?.message ||
              'Product saved, but the image upload failed. You can try uploading it again from this product\u2019s edit page.'
          );
          loadTaxonomy();
          navigate(`/admin/products/${productId}`);
          return;
        }
      }

      toast.success(isEdit ? 'Product updated' : 'Product created');
      loadTaxonomy(); // pick up any brand/category just created
      navigate('/admin/products');
    } catch (err) {
      // Surface the specific field error(s) instead of a bare "Validation
      // failed" — express-validator returns {field, message} objects,
      // Mongoose validation errors return plain message strings.
      const details = err.response?.data?.errors;
      if (Array.isArray(details) && details.length > 0) {
        const first = details[0];
        toast.error(typeof first === 'string' ? first : `${first.field ? `${first.field}: ` : ''}${first.message}`);
      } else {
        toast.error(err.response?.data?.message || 'Could not save product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTags = watch('tags') || [];

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/admin/products" className="flex items-center gap-2 text-sm text-ivory/50 hover:text-gold">
        <HiArrowLeft /> Back to products
      </Link>
      <h1 className="heading-display text-3xl">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Product Name" error={errors.name?.message}>
          <input className={inputClass} {...register('name', { required: 'Name is required' })} />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField label="Maison / Brand" error={errors.brandName?.message}>
            <input
              list="brand-options"
              className={inputClass}
              placeholder="Type a brand name…"
              autoComplete="off"
              {...register('brandName', { required: 'Brand is required' })}
            />
            <datalist id="brand-options">
              {brands.map((b) => <option key={b._id} value={b.name} />)}
            </datalist>
            <p className="text-xs text-ivory/40 mt-1.5">
              Type an existing name to reuse it, or a new one to create it automatically.
            </p>
          </FormField>
          <FormField label="Category" error={errors.categoryName?.message}>
            <input
              list="category-options"
              className={inputClass}
              placeholder="Type a category name…"
              autoComplete="off"
              {...register('categoryName', { required: 'Category is required' })}
            />
            <datalist id="category-options">
              {categories.map((c) => <option key={c._id} value={c.name} />)}
            </datalist>
            <p className="text-xs text-ivory/40 mt-1.5">
              Type an existing name to reuse it, or a new one to create it automatically.
            </p>
          </FormField>
        </div>

        <FormField label="Description" error={errors.description?.message}>
          <textarea
            rows={4}
            className={inputClass}
            {...register('description', { required: 'Description is required' })}
          />
        </FormField>

        <div className="grid sm:grid-cols-3 gap-5">
          <FormField label="Top Notes">
            <input className={inputClass} {...register('notes.top')} />
          </FormField>
          <FormField label="Heart Notes">
            <input className={inputClass} {...register('notes.heart')} />
          </FormField>
          <FormField label="Base Notes">
            <input className={inputClass} {...register('notes.base')} />
          </FormField>
        </div>

        <FormField label="Tags">
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <label
                key={tag}
                className={`px-3 py-1.5 border text-xs uppercase tracking-wide cursor-pointer transition-colors ${
                  selectedTags.includes(tag) ? 'bg-gold text-obsidian border-gold' : 'border-gold/25 text-ivory/60'
                }`}
              >
                <input type="checkbox" value={tag} {...register('tags')} className="sr-only" />
                {tag}
              </label>
            ))}
          </div>
        </FormField>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-widest2 uppercase text-ivory/50">Size Variants</p>
            <button
              type="button"
              onClick={() => append({ label: '', sku: '', price: '', compareAtPrice: '', stock: '' })}
              className="flex items-center gap-1 text-xs text-gold hover:underline"
            >
              <HiOutlinePlus /> Add variant
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center glass p-3">
                <input placeholder="Label (50ml)" className={inputClass} {...register(`variants.${index}.label`, { required: true })} />
                <input placeholder="SKU" className={inputClass} {...register(`variants.${index}.sku`, { required: true })} />
                <input type="number" step="0.01" placeholder="Price" className={inputClass} {...register(`variants.${index}.price`, { required: true })} />
                <input type="number" step="0.01" placeholder="Compare at" className={inputClass} {...register(`variants.${index}.compareAtPrice`)} />
                <input type="number" placeholder="Stock" className={inputClass} {...register(`variants.${index}.stock`, { required: true })} />
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  className="text-ember-light hover:opacity-70 justify-self-end"
                  aria-label="Remove variant"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <FormField label="Product Images">
          {productImages.length > 0 && (
            <div className="flex gap-3 mb-3">
              {productImages.map((img) => (
                <img key={img.publicId} src={img.url} alt="" className="w-16 h-16 object-cover rounded-sm border border-gold/20" />
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewImages(Array.from(e.target.files))}
            className="text-sm text-ivory/60"
          />
          <p className="text-xs text-ivory/40 mt-1">Uploads to Cloudinary once you save.</p>
        </FormField>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <Link to="/admin/products" className="px-8 py-3.5 border border-gold/25 text-xs tracking-widest2 uppercase text-ivory/60">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
