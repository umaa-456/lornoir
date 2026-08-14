import { Helmet } from 'react-helmet-async';
import Reveal from '@/components/ui/Reveal';

/**
 * Consistent shell for editorial/legal/informational pages — keeps
 * typography and spacing uniform across About, FAQ, Shipping, Privacy,
 * etc. without every page reimplementing the same header block.
 */
export default function StaticPage({ eyebrow, title, subtitle, metaDescription, maxWidth = 'max-w-3xl', children }) {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
      <Helmet>
        <title>{title} — L'Or Noir</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
      </Helmet>

      <div className={maxWidth}>
        <Reveal>
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="heading-display text-4xl md:text-5xl mb-6">{title}</h1>
          {subtitle && <p className="text-ivory/60 leading-relaxed mb-10 max-w-xl">{subtitle}</p>}
        </Reveal>

        <Reveal delay={0.1} className="prose-content">
          {children}
        </Reveal>
      </div>
    </div>
  );
}
