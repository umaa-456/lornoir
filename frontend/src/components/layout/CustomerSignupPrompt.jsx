import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/** A storefront-only signup invitation; it deliberately lives outside Navbar. */
export default function CustomerSignupPrompt() {
  const { isAuthenticated, loading } = useAuth();

  if (loading || isAuthenticated) return null;

  return (
    <section className="luxury-dark relative z-20 bg-charcoal px-4 pb-5 pt-24 sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-7xl justify-end">
        <aside className="w-full max-w-sm border border-gold/35 bg-primary px-5 py-4 shadow-glass sm:px-6">
          <p className="eyebrow mb-1">New to Arwa Store?</p>
          <p className="font-display text-xl text-ivory">Create your account</p>
          <p className="mt-1 text-sm leading-relaxed text-ivory/65">
            Save favourites, track orders, and enjoy a more personal shopping experience.
          </p>
          <Link
            to="/signup"
            data-cursor-hover
            className="mt-4 inline-flex items-center border border-gold bg-gold px-4 py-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-obsidian transition-colors hover:bg-gold-pale"
          >
            Create Account
          </Link>
        </aside>
      </div>
    </section>
  );
}
