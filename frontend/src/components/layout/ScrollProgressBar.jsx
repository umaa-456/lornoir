import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * A hairline gold thread that tracks scroll progress — the signature
 * "gold thread" motif that recurs across the site (see also the
 * hero mist trail and section dividers).
 */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[70] bg-gold-sheen bg-[length:200%_auto] animate-gold-shimmer"
      aria-hidden="true"
    />
  );
}
