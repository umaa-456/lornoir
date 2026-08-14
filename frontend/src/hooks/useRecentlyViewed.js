import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lornoir_recently_viewed';
const MAX_ITEMS = 8;

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Tracks recently-viewed product slugs (not the old mock _id scheme) so
 * they can be re-fetched from the real API on the product detail page. */
export default function useRecentlyViewed() {
  const [slugs, setSlugs] = useState(read);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs]);

  const recordView = useCallback((slug) => {
    setSlugs((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_ITEMS));
  }, []);

  return { slugs, recordView };
}
