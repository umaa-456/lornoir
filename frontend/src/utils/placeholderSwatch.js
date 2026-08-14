const PALETTE = [
  ['#1a1512', '#B84E12'],
  ['#221c14', '#F2701A'],
  ['#181310', '#FFC896'],
  ['#241a1a', '#7a2a20'],
  ['#1c1613', '#5b1a1a'],
  ['#191512', '#B84E12'],
  ['#1e2118', '#F2701A'],
];

/** Simple deterministic string hash, used so the same product always
 * gets the same placeholder gradient instead of a random one on every render. */
function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Returns a CSS gradient string for products without photography yet. */
export function placeholderSwatch(seed = '') {
  const [from, to] = PALETTE[hashString(seed) % PALETTE.length];
  return `linear-gradient(155deg, ${from}, ${to})`;
}

/** First real product image URL, or a deterministic placeholder gradient. */
export function productImage(product) {
  return product?.images?.[0]?.url || null;
}
