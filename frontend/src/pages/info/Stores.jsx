import { Helmet } from 'react-helmet-async';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlinePhone } from 'react-icons/hi';
import Reveal from '@/components/ui/Reveal';

const STORES = [
  {
    city: 'Paris',
    address: '24 Rue de la Paix, 75002 Paris, France',
    hours: 'Mon–Sat, 10:00–19:00',
    phone: '+33 1 42 60 30 30',
  },
  {
    city: 'New York',
    address: '412 Greene Street, SoHo, New York, NY 10012',
    hours: 'Mon–Sun, 11:00–20:00',
    phone: '+1 (212) 555-0173',
  },
  {
    city: 'Dubai',
    address: 'The Dubai Mall, Fashion Avenue, Dubai, UAE',
    hours: 'Daily, 10:00–22:00',
    phone: '+971 4 555 0192',
  },
];

export default function Stores() {
  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 md:px-10">
      <Helmet>
        <title>Boutiques — L'Or Noir</title>
        <meta name="description" content="Visit an L'Or Noir boutique." />
      </Helmet>

      <Reveal className="mb-14 max-w-xl">
        <p className="eyebrow mb-3">Visit Us</p>
        <h1 className="heading-display text-4xl md:text-5xl">Boutiques</h1>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6">
        {STORES.map((store, i) => (
          <Reveal key={store.city} delay={i * 0.08}>
            <div className="glass p-6 h-full">
              <h2 className="font-display text-2xl mb-4">{store.city}</h2>
              <div className="space-y-3 text-sm text-ivory/70">
                <p className="flex items-start gap-2.5">
                  <HiOutlineLocationMarker className="text-gold mt-0.5 shrink-0" /> {store.address}
                </p>
                <p className="flex items-center gap-2.5">
                  <HiOutlineClock className="text-gold shrink-0" /> {store.hours}
                </p>
                <p className="flex items-center gap-2.5">
                  <HiOutlinePhone className="text-gold shrink-0" /> {store.phone}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
