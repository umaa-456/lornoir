import { Link } from 'react-router-dom';

export { default as StatusBadge } from '@/components/ui/StatusBadge';

export function StatCard({ label, value, icon: Icon, hint, to, highlight }) {
  const content = (
    <div
      className={`glass p-5 rounded-sm h-full transition-colors ${
        to ? 'hover:border-gold/40 border border-transparent cursor-pointer' : ''
      } ${highlight ? 'border border-gold/30' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ivory/50 mb-2">{label}</p>
          <p className={`font-display text-2xl md:text-3xl ${highlight ? 'text-gold' : ''}`}>{value}</p>
          {hint && <p className="text-xs text-gold/70 mt-1">{hint}</p>}
        </div>
        {Icon && <Icon className={`text-2xl ${highlight ? 'text-gold' : 'text-gold/60'}`} />}
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
