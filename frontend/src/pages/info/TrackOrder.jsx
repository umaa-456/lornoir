import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Reveal from '@/components/ui/Reveal';
import { useAuth } from '@/context/AuthContext';

export default function TrackOrder() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="pt-32 pb-24 max-w-2xl mx-auto px-6 text-center">
      <Helmet>
        <title>Track Order — L'Or Noir</title>
        <meta name="description" content="Track your L'Or Noir order." />
      </Helmet>

      <Reveal>
        <p className="eyebrow mb-3">Order Status</p>
        <h1 className="heading-display text-4xl md:text-5xl mb-6">Track Your Order</h1>

        {isAuthenticated ? (
          <>
            <p className="text-ivory/60 leading-relaxed mb-8">
              Every order placed with your account — along with its current
              status and tracking number once shipped — is available in your
              order history.
            </p>
            <Link
              to="/account/orders"
              data-cursor-hover
              className="inline-block px-9 py-4 text-xs tracking-widest2 uppercase bg-gold text-obsidian font-semibold hover:bg-gold-pale transition-colors"
            >
              View Your Orders
            </Link>
          </>
        ) : (
          <>
            <p className="text-ivory/60 leading-relaxed mb-8">
              Sign in to your account to see live status and tracking
              information for every order you've placed with us.
            </p>
            <Link
              to="/login"
              state={{ from: '/account/orders' }}
              data-cursor-hover
              className="inline-block px-9 py-4 text-xs tracking-widest2 uppercase bg-gold text-obsidian font-semibold hover:bg-gold-pale transition-colors"
            >
              Sign In
            </Link>
          </>
        )}
      </Reveal>
    </div>
  );
}
