# L'Or Noir — Luxury Perfume E-Commerce

A full-stack MERN e-commerce platform for a premium fragrance house.

## Structure
```
lornoir/
  frontend/   React 19 + Vite + Tailwind (this phase)
  backend/    Node + Express + MongoDB (later phase)
```

## Build phases
- [x] **Phase 1 — Frontend foundation**: scaffold, design tokens, layout shell (navbar, footer, cursor, scroll progress), cart/wishlist/auth contexts, hero section
- [x] **Phase 2 — Full landing page**: animated stats bar, tabbed product showcase, category tiles, flash sale with live countdown, review carousel, Instagram gallery, FAQ accordion — all scroll-revealed
- [x] **Phase 3 — Product system**: shop listing with live search/filters/sort/pagination, product detail with zoom gallery, size variants, notes tabs, reviews (with rating breakdown + write/edit/delete for signed-in users), related products, recently viewed
- [~] **Phase 4 — Auth screens + user dashboard**: login/signup/forgot-password built; reset-password, protected routes, account dashboard, cart/wishlist/checkout pages still pending — resuming after Phase 5
- [x] **Phase 5 — Backend core**: Express app with full security stack (helmet, CORS, rate limiting, mongo-sanitize, compression), all 11 Mongoose models (User, Product, Brand, Category, Order, Review, Coupon, Wishlist, Cart, Address, Notification), JWT auth (register/login/logout/me/avatar upload/change password/email verification/forgot-reset password), Cloudinary + Nodemailer services, global error handler, DB seed script
- [x] **Phase 6 — Backend commerce APIs**: products (search/filter/sort/pagination + admin CRUD + Cloudinary image management + low-stock report), brands, categories, cart (add/update/remove/clear/coupon), wishlist, addresses, reviews (with verified-purchase detection), coupons, orders (checkout with atomic stock decrement, cancel with stock restore, admin status/refund management), notifications
- [x] **Phase 7 — Admin panel**: separate `/admin` console (own login, layout, auth guard for admin/employee roles) with: dashboard (revenue trend + top-products charts via Recharts, recent orders), full product CRUD with dynamic size variants and Cloudinary image upload, order management with status workflow + tracking + refunds, category & brand management, customer/employee role management, review moderation, coupon CRUD, low-stock inventory alerts, and account settings
- [x] **Phase 8 — Payments, PWA, deployment**: Stripe integration end-to-end (PaymentIntent creation, Stripe Elements card form, webhook with raw-body signature verification, payment status verified server-side at order creation); Cart, Checkout (address → payment → review), and Order Confirmation pages; full PWA setup via `vite-plugin-pwa` (manifest, generated icon set, offline-capable catalogue browsing, cart/orders/auth kept network-only); `vercel.json` and `render.yaml` deployment configs
- [x] **Closing pass** — reset-password page, and the full account dashboard: profile editing + avatar upload, order history + order detail with cancellation, saved-address CRUD, notifications inbox, and a standalone wishlist page (move-to-cart / remove). All wired into the router behind a customer `ProtectedRoute`, consistent with the admin panel's own guard.

All 8 phases and every route in the original spec are now built as real, working code — no placeholders, no stub pages, no dead links from the navbar.

## Deployment
- **Frontend → Vercel**: point Vercel at `frontend/`, it auto-detects Vite via `vercel.json`. Set `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` as environment variables in the Vercel dashboard.
- **Backend → Render**: point Render at `backend/`, it picks up `render.yaml` (Node web service, health check at `/health`). Fill in the `sync: false` environment variables (Mongo URI, Cloudinary, SMTP, Stripe keys, `CLIENT_URL`) in the Render dashboard — they're intentionally not committed to the repo.
- **Stripe webhook**: after deploying the backend, register `https://your-backend-url/api/v1/payments/webhook` in the Stripe dashboard for `payment_intent.succeeded` and `payment_intent.payment_failed`, then set `STRIPE_WEBHOOK_SECRET` to the signing secret Stripe gives you.

## Running the backend locally
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, SMTP + Cloudinary keys
npm install
npm run seed            # creates an admin user + base brands/categories
npm run dev
```
Requires Node 18+ and a running MongoDB instance (local or Atlas). API serves at `http://localhost:5000/api/v1`.

## Running the frontend locally
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Requires Node 18+. The dev server runs at `http://localhost:5173`.

## Design system
- **Palette**: obsidian `#0A0908`, ivory `#F6F1E7`, champagne gold `#C6A15B`, deep bronze `#8C6D2F`, ember `#5B1A1A`
- **Type**: Cormorant Garamond (display), Cormorant SC (wordmark), Manrope (body/UI)
- **Signature motif**: a hairline gold thread — the scroll-progress bar, section dividers, and the hero's shimmering silhouette all share this one recurring gesture, rather than scattering unrelated effects across the page

## Notes
- Product imagery uses generated gold-gradient placeholders in `src/data/mockProducts.js` — swap in real photography before launch.
- The landing page (Phase 2) reads from that same mock catalogue so it renders fully without a backend. Its shape mirrors the future Product API response, so Phase 6 swaps it for real `services/products.js` calls with no rewrite.
- Cart/wishlist are localStorage-backed until the backend (Phase 5+) is wired in; the API client is already in place at `src/services/api.js`.

## Post-delivery fixes
After initial delivery, testing surfaced and fixed:
- **Broken backend imports** in `app.js` (`../routes/...` should have been `./routes/...` — `app.js` sits inside `src/`, a sibling of `routes`/`middlewares`/`utils`, not one level above them)
- **Invisible text in light mode** — `text-ivory` and `bg-obsidian` were fixed hex colors instead of theme-aware; now driven by CSS variables that invert per theme, so every existing usage across the app works in both dark and light without touching each component
- **Dead navbar/footer links** — `/brands`, `/new-arrivals`, `/best-sellers`, `/about`, `/faq`, `/contact` (with a real working contact form emailing through the existing Nodemailer service), `/shipping`, `/privacy`, `/terms`, `/sustainability`, `/journal`, `/stores`, `/track-order` were linked from the nav/footer but never built — all now exist as real pages
- **Category filter slug mismatch** — `/shop?category=oud-amber` wasn't matching the "Oud & Amber" category name
- **Styled 404** — replaced React Router's raw default error screen with a themed one

## Major rebrand + real-data pass
- **Color scheme**: black + orange (was black + gold). The `gold` token name was kept internally (referenced ~500 times as `text-gold`, `bg-gold`, `border-gold/40`, etc.) but re-valued to a new orange palette (`#F2701A` primary, `#B84E12` deep, `#FFC896` pale), so every existing usage across all ~90 files updated automatically. All hardcoded hex values in SVGs, chart colors, and gradients were also swept and updated.
- **Fonts**: Cormorant Garamond/SC (delicate serif) replaced with Space Grotesk (bold display) + Manrope (body) for a more modern, confident feel matching the new palette.
- **SEO**: `robots.txt`, static `sitemap.xml`, a **dynamic** backend sitemap (`GET /sitemap.xml`) that includes every active product/brand/category automatically, Open Graph + Twitter Card meta tags, JSON-LD structured data (Organization, WebSite with sitelinks search box, and per-product Product schema with price/availability/rating for rich results), and `noindex` on the entire admin console.
  - **Note on the dynamic sitemap**: since frontend and backend deploy to separate domains (Vercel + Render), search engines associate a sitemap with the domain it's served from. In production, either proxy `/sitemap.xml` from your frontend domain to the backend endpoint, or submit the backend's sitemap URL directly in Google Search Console.
- **All dummy/mock product data removed.** `data/mockProducts.js` is deleted. Every page that used to read from it — the homepage sections (featured/trending/new/bestseller tabs, flash sale, category tiles, testimonials, trust-bar stats), the shop listing with filters, product detail, reviews, wishlist, and admin — now calls the real backend API. A fresh database (after `npm run seed`, which only creates an admin user + brands + categories, no products) starts genuinely empty, with graceful empty states everywhere ("no products yet — add some from the admin dashboard") until you add real products.
- **Product URLs are now SEO-friendly slugs** (`/product/nuit-d-ambre`) instead of raw Mongo IDs.
- **Admin dashboard**: Pending Orders and Low Stock now have their own dedicated, clickable stat cards (previously combined into one vague "Needs Attention" number) that deep-link into filtered views.
- **Adding products**: already fully built — `/admin/products/new` has a complete form (name, brand, category, description, notes, tags, dynamic size/price/stock variants, Cloudinary image upload). This is the only way products enter the catalogue now.
