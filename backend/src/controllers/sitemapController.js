import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import asyncHandler from '../utils/asyncHandler.js';

function urlEntry(loc, lastmod, priority = '0.7', changefreq = 'weekly') {
  return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

/**
 * Generates a sitemap covering static routes plus every active product,
 * brand, and category — so new products become discoverable to search
 * engines automatically, without editing a static XML file by hand.
 */
export const getSitemap = asyncHandler(async (req, res) => {
  const base = process.env.CLIENT_URL || 'https://www.lornoir.com';

  const [products, categories, brands] = await Promise.all([
    Product.find({ isActive: true }).select('slug updatedAt'),
    Category.find({ isActive: true }).select('slug updatedAt'),
    Brand.find({ isActive: true }).select('slug updatedAt'),
  ]);

  const staticUrls = [
    urlEntry(`${base}/`, null, '1.0', 'daily'),
    urlEntry(`${base}/shop`, null, '0.9', 'daily'),
    urlEntry(`${base}/brands`, null, '0.7', 'weekly'),
    urlEntry(`${base}/new-arrivals`, null, '0.8', 'daily'),
    urlEntry(`${base}/best-sellers`, null, '0.8', 'daily'),
    urlEntry(`${base}/about`, null, '0.5', 'monthly'),
    urlEntry(`${base}/journal`, null, '0.6', 'weekly'),
    urlEntry(`${base}/sustainability`, null, '0.4', 'monthly'),
    urlEntry(`${base}/stores`, null, '0.4', 'monthly'),
    urlEntry(`${base}/faq`, null, '0.5', 'monthly'),
    urlEntry(`${base}/contact`, null, '0.5', 'monthly'),
    urlEntry(`${base}/shipping`, null, '0.4', 'monthly'),
    urlEntry(`${base}/privacy`, null, '0.2', 'yearly'),
    urlEntry(`${base}/terms`, null, '0.2', 'yearly'),
  ];

  const productUrls = products.map((p) =>
    urlEntry(`${base}/product/${p._id}`, p.updatedAt?.toISOString(), '0.8', 'weekly')
  );
  const categoryUrls = categories.map((c) =>
    urlEntry(`${base}/shop?category=${c.slug}`, c.updatedAt?.toISOString(), '0.6', 'weekly')
  );
  const brandUrls = brands.map((b) =>
    urlEntry(`${base}/shop?brand=${b._id}`, b.updatedAt?.toISOString(), '0.5', 'weekly')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...productUrls, ...categoryUrls, ...brandUrls].join('\n')}
</urlset>`;

  res.type('application/xml').send(xml);
});
