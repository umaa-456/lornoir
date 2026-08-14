import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import siteSettingsRoutes from './routes/siteSettingsRoutes.js';
import { getSitemap } from './controllers/sitemapController.js';
import { stripeWebhook } from './controllers/paymentController.js';
import errorHandler from './middlewares/errorHandler.js';
import ApiError from './utils/ApiError.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

const app = express();
const API_PREFIX = '/api/v1';

// ---------- Security & performance middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---------- Stripe webhook ----------
// Must be registered with the raw body parser BEFORE express.json() below,
// since Stripe's signature verification needs the untouched request body.
app.post(`${API_PREFIX}/payments/webhook`, express.raw({ type: 'application/json' }), stripeWebhook);

// ---------- Body parsing (everything else) ----------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

// ---------- Rate limiting (applies to all /api routes) ----------
app.use('/api', apiLimiter);

// ---------- Health check ----------
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

// ---------- Dynamic sitemap ----------
// Includes every active product/brand/category from the live database.
// In production, proxy this from the frontend's own domain (see README's
// SEO section) so it counts as that domain's sitemap for search engines.
app.get('/sitemap.xml', getSitemap);

// ---------- API routes ----------
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/brands`, brandRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
app.use(`${API_PREFIX}/addresses`, addressRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/coupons`, couponRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);
app.use(`${API_PREFIX}/site-settings`, siteSettingsRoutes);

// ---------- 404 handler ----------
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// ---------- Global error handler (must be last) ----------
app.use(errorHandler);

export default app;
