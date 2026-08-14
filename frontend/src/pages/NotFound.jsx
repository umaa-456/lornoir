import { Link, useRouteError } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const error = useRouteError();
  const is404 = !error || error?.status === 404;

  return (
    <div className="min-h-screen bg-noir-radial flex items-center justify-center px-6 text-center">
      <Helmet><title>{is404 ? 'Page Not Found' : 'Something Went Wrong'} — L'Or Noir</title></Helmet>
      <div>
        <p className="font-script text-2xl tracking-widest3 uppercase text-gold-sheen mb-8">L'Or Noir</p>
        <p className="eyebrow mb-3">{is404 ? '404' : 'Error'}</p>
        <h1 className="heading-display text-4xl md:text-5xl mb-6">
          {is404 ? 'This page has drifted out of scent.' : 'Something went wrong.'}
        </h1>
        <p className="text-ivory/60 mb-10 max-w-md mx-auto">
          {is404
            ? "The page you're looking for doesn't exist, or has moved."
            : "We hit an unexpected error loading this page — please try again."}
        </p>
        <Link
          to="/"
          className="inline-block px-9 py-4 text-xs tracking-widest2 uppercase bg-gold text-obsidian font-semibold hover:bg-gold-pale transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
