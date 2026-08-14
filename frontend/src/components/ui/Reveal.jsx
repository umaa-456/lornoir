import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * Wraps children in a fade-up reveal that triggers once, the moment it
 * enters the viewport. `delay` lets sibling elements stagger by hand
 * when a full framer `stagger` isn't warranted (e.g. mixed layouts).
 */
export default function Reveal({ children, delay = 0, y = 32, className = '', as = 'div' }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}
