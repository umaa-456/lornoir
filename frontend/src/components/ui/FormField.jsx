export default function FormField({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-[11px] tracking-widest2 uppercase text-ivory/50 mb-2">{label}</label>}
      {children}
      {error && <p className="text-ember-light text-xs mt-1.5" role="alert">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full bg-transparent border border-gold/25 px-4 py-3 text-sm focus:outline-none focus:border-gold placeholder:text-ivory/30';
