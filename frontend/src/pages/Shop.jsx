import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineAdjustments, HiX } from 'react-icons/hi';
import Reveal from '@/components/ui/Reveal';
import { ProductCardSkeleton } from '@/components/ui/Loader';
import ProductCard from '@/components/product/ProductCard';
import FilterSidebar from '@/components/product/FilterSidebar';
import { productsApi, brandsApi, categoriesApi } from '@/services/products';

const PRICE_BOUNDS = { min: 0, max: 1000 };
const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Highest Rated' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const [filters, setFilters] = useState({
    categories: params.get('category') ? [params.get('category')] : [],
    brands: params.get('brand') ? [params.get('brand')] : [],
    maxPrice: PRICE_BOUNDS.max,
    minRating: 0,
  });

  // Taxonomy for the filter sidebar loads once.
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => toast.error('Could not load categories'));
    brandsApi.list().then(setBrands).catch(() => toast.error('Could not load brands'));
  }, []);

  // Product list refetches whenever search/filters/sort/page change,
  // debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setProducts(null);
      productsApi
        .list({
          q: search || undefined,
          category: filters.categories.length ? filters.categories.join(',') : undefined,
          brand: filters.brands.length ? filters.brands.join(',') : undefined,
          maxPrice: filters.maxPrice < PRICE_BOUNDS.max ? filters.maxPrice : undefined,
          minRating: filters.minRating || undefined,
          sort,
          page,
          limit: 12,
        })
        .then((data) => {
          setProducts(data.products);
          setPagination(data.pagination);
        })
        .catch(() => toast.error('Could not load products'));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, filters, sort, page]);

  const handleFilterChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ categories: [], brands: [], maxPrice: PRICE_BOUNDS.max, minRating: 0 });
    setParams({});
    setPage(1);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
      <Helmet>
        <title>Shop All Fragrances — L'Or Noir</title>
        <meta name="description" content="Browse the full L'Or Noir collection — oud, floral, woody, leather, and gourmand compositions." />
      </Helmet>

      <Reveal className="mb-12">
        <p className="eyebrow mb-3">Boutique</p>
        <h1 className="heading-display text-4xl md:text-5xl">The Full Collection</h1>
      </Reveal>

      {/* Search + sort bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search fragrances…"
            className="w-full bg-transparent border border-gold/25 pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-gold placeholder:text-ivory/40"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-obsidian border border-gold/25 px-4 py-3 text-sm text-ivory/80 focus:outline-none focus:border-gold"
          aria-label="Sort products"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              Sort: {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setMobileFiltersOpen(true)}
          data-cursor-hover
          className="lg:hidden flex items-center justify-center gap-2 border border-gold/25 px-4 py-3 text-sm"
        >
          <HiOutlineAdjustments /> Filters
        </button>
      </div>

      <div className="flex gap-12">
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
            priceBounds={PRICE_BOUNDS}
            categories={categories}
            brands={brands}
          />
        </div>

        <div className="flex-1">
          <p className="text-xs text-ivory/40 mb-6">
            {products ? `${pagination.total} result${pagination.total !== 1 ? 's' : ''}` : 'Loading…'}
          </p>

          {!products ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              {pagination.total === 0 && !search && filters.categories.length === 0 && filters.brands.length === 0 ? (
                <>
                  <p className="font-display text-2xl mb-3">No fragrances in the boutique yet.</p>
                  <p className="text-ivory/50 text-sm">
                    Products added from the admin dashboard will appear here automatically.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl mb-3">No fragrances match those filters.</p>
                  <button onClick={resetFilters} data-cursor-hover className="text-gold text-sm underline">
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {products.map((product, i) => (
                <Reveal key={product._id} delay={i * 0.04}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  data-cursor-hover
                  className={`w-9 h-9 text-sm border transition-colors ${
                    page === i + 1
                      ? 'bg-gold text-obsidian border-gold font-semibold'
                      : 'border-gold/25 text-ivory/60 hover:border-gold/60'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-obsidian/80" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] glass p-6 overflow-y-auto">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mb-6 text-xl text-ivory/60"
              aria-label="Close filters"
            >
              <HiX />
            </button>
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={resetFilters}
              priceBounds={PRICE_BOUNDS}
              categories={categories}
              brands={brands}
            />
          </div>
        </div>
      )}
    </div>
  );
}
