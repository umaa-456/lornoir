const RATINGS = [4, 3];

export default function FilterSidebar({ filters, onChange, onReset, priceBounds, categories, brands }) {
  const toggle = (key, value) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-10">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Filters</p>
        <button onClick={onReset} data-cursor-hover className="text-xs text-ivory/50 hover:text-gold">
          Clear all
        </button>
      </div>

      <FilterGroup title="Category">
        {categories.length === 0 && <p className="text-xs text-ivory/40">No categories yet</p>}
        {categories.map((cat) => (
          <FilterCheckbox
            key={cat.slug}
            label={cat.name}
            checked={filters.categories.includes(cat.slug)}
            onChange={() => toggle('categories', cat.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Maison">
        {brands.length === 0 && <p className="text-xs text-ivory/40">No maisons yet</p>}
        {brands.map((brand) => (
          <FilterCheckbox
            key={brand.slug}
            label={brand.name}
            checked={filters.brands.includes(brand.slug)}
            onChange={() => toggle('brands', brand.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="px-1">
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-gold"
            aria-label="Maximum price"
          />
          <div className="flex justify-between text-xs text-ivory/50 mt-2">
            <span>${priceBounds.min}</span>
            <span className="text-gold">Up to ${filters.maxPrice}</span>
            <span>${priceBounds.max}</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        {RATINGS.map((r) => (
          <FilterCheckbox
            key={r}
            label={`${r}★ & up`}
            checked={filters.minRating === r}
            onChange={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <p className="text-[11px] tracking-widest2 uppercase text-ivory/50 mb-4">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-ivory/75 cursor-pointer group" data-cursor-hover>
      <span
        className={`w-4 h-4 border shrink-0 flex items-center justify-center transition-colors ${
          checked ? 'bg-gold border-gold' : 'border-gold/30 group-hover:border-gold/60'
        }`}
      >
        {checked && <span className="w-2 h-2 bg-obsidian" />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="group-hover:text-gold transition-colors">{label}</span>
    </label>
  );
}
