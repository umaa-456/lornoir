import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { animate } from 'framer-motion';

export default function AnimatedCounter({ to, prefix = '', suffix = '', duration = 1.6 }) {
  const spanRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (!inView || !spanRef.current) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        if (spanRef.current) {
          spanRef.current.textContent = `${prefix}${Math.round(value).toLocaleString()}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [inView, to, duration, prefix, suffix]);

  return (
    <span ref={ref}>
      <span ref={spanRef}>{prefix}0{suffix}</span>
    </span>
  );
}
