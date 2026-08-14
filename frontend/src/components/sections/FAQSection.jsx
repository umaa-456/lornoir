import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus } from 'react-icons/hi';
import Reveal from '@/components/ui/Reveal';
import { FAQS } from '@/data/faqs';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="max-w-3xl mx-auto px-6 md:px-10 py-24">
      <Reveal className="text-center mb-14">
        <p className="eyebrow mb-3">Good to Know</p>
        <h2 className="heading-display text-4xl md:text-5xl">Frequently asked questions</h2>
      </Reveal>

      <div className="divide-y divide-gold/10 border-t border-b border-gold/10">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <Reveal key={faq.q} delay={i * 0.05}>
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                data-cursor-hover
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 py-6 text-left"
              >
                <span className="font-display text-lg md:text-xl">{faq.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gold text-xl shrink-0"
                >
                  <HiPlus />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-ivory/60 leading-relaxed max-w-xl">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
