import { createContext, useContext, useEffect, useState } from 'react';
import { siteSettingsApi } from '@/services/siteSettings';

const DEFAULTS = {
  siteName: 'Arwa Store',
  currency: 'PKR',
  whatsapp: {
    number: '+923176346085',
    prefilledMessage: 'Assalam-o-Alaikum! ✨\n\nI would like to know more about Arwa Store products.',
  },
  logo: { url: null },
  hero: {
    eyebrow: 'The 2026 Collection — No. VII',
    titleLine1: 'Scent is the',
    titleLine2: 'only memory',
    titleLine3: 'that never fades.',
    subtitle:
      "Hand-composed in small batches from rare oud, orris root, and centuries-old distillation houses — worn, not sprayed.",
  },
  footerTagline:
    'Rare fragrances, hand-composed in small batches for those who wear scent as a signature, not an accessory.',
  contact: { email: 'hello@arwastore.pk', phone: '+92 317 6346085', address: 'Pakistan' },
};

const SiteSettingsContext = createContext({ settings: DEFAULTS, loading: true, refresh: () => {} });

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    siteSettingsApi
      .get()
      .then((data) => setSettings({ ...DEFAULTS, ...data, hero: { ...DEFAULTS.hero, ...data.hero }, contact: { ...DEFAULTS.contact, ...data.contact } }))
      .catch(() => {
        /* Backend unreachable or not yet configured — fall back to defaults silently. */
      })
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
