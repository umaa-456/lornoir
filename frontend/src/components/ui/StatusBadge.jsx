const STATUS_STYLES = {
  pending: 'bg-ivory/10 text-ivory/70',
  processing: 'bg-blue-500/15 text-blue-300',
  shipped: 'bg-gold/15 text-gold',
  delivered: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-ember/20 text-ember-light',
  refunded: 'bg-ember/20 text-ember-light',
  paid: 'bg-green-500/15 text-green-400',
  failed: 'bg-ember/20 text-ember-light',
  active: 'bg-green-500/15 text-green-400',
  inactive: 'bg-ivory/10 text-ivory/50',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[10px] tracking-wide uppercase font-semibold ${
        STATUS_STYLES[status] || 'bg-ivory/10 text-ivory/60'
      }`}
    >
      {status}
    </span>
  );
}
