import dns from 'node:dns';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

// Node 18+ Happy Eyeballs can stall on Atlas SRV IPv6 for several seconds on Vercel.
dns.setDefaultResultOrder('ipv4first');
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

/**
 * Reuse one connection across Vercel warm invocations. A new connect() on
 * every request races with in-flight queries and triggers mongoose buffering
 * timeouts (`products.find()` after 10000ms).
 */
const globalCache = globalThis;
if (!globalCache.__mongoose) {
  globalCache.__mongoose = { conn: null, promise: null, indexesReady: false };
}

export function mongoUri() {
  return (
    process.env.MONGO_URI?.trim() ||
    process.env.MONGODB_URI?.trim() ||
    process.env.MONGODB_URL?.trim() ||
    ''
  );
}

export function sanitizeMongoError(message) {
  return String(message || '').replace(/mongodb(\+srv)?:\/\/\S+/gi, 'mongodb://***');
}

/**
 * Product display and merchandising data is deliberately non-unique. MongoDB
 * retains indexes after a schema changes, so remove legacy unique Product
 * indexes at startup. `slug` is the sole exception: it is an internal route
 * identifier and the Product hook guarantees a unique value for it.
 */
async function reconcileProductIndexes() {
  if (globalCache.__mongoose.indexesReady) return;

  let indexes = [];
  try {
    indexes = await Product.collection.indexes();
  } catch (err) {
    // A fresh database has no products collection yet; createIndexes below
    // will create it and establish the declared indexes.
    if (err.code !== 26) throw err;
  }
  const obsoleteUniqueIndexes = indexes.filter((index) => {
    if (!index.unique || index.name === '_id_') return false;
    const fields = Object.keys(index.key);
    return !(fields.length === 1 && fields[0] === 'slug' && index.key.slug === 1);
  });

  for (const index of obsoleteUniqueIndexes) {
    try {
      await Product.collection.dropIndex(index.name);
      console.log(`Removed obsolete unique Product index: ${index.name}`);
    } catch (err) {
      // Multiple application instances can reconcile concurrently. If another
      // instance removed the index first, the desired state has been reached.
      if (err.code !== 27) throw err;
    }
  }

  await Product.createIndexes();
  globalCache.__mongoose.indexesReady = true;
}

function connectOptions(family) {
  return {
    bufferCommands: false,
    serverSelectionTimeoutMS: 12000,
    socketTimeoutMS: 20000,
    maxPoolSize: process.env.VERCEL ? 1 : 10,
    minPoolSize: 0,
    maxIdleTimeMS: 25000,
    ...(family ? { family } : {}),
  };
}

async function openConnection(uri) {
  try {
    return await mongoose.connect(uri, connectOptions(4));
  } catch (firstErr) {
    console.error(`MongoDB IPv4 connect failed: ${sanitizeMongoError(firstErr.message)}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    return mongoose.connect(uri, connectOptions());
  }
}

export default async function connectDB() {
  const uri = mongoUri();
  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Add it in Vercel → Project → Settings → Environment Variables for Production, then redeploy.'
    );
  }

  if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(uri)) {
    throw new Error(
      'MONGO_URI points at localhost. Vercel cannot reach your PC — use a MongoDB Atlas connection string.'
    );
  }

  if (mongoose.connection.readyState === 1 && globalCache.__mongoose.conn) {
    return globalCache.__mongoose.conn;
  }

  if (!globalCache.__mongoose.promise) {
    globalCache.__mongoose.promise = openConnection(uri);
  }

  try {
    const conn = await globalCache.__mongoose.promise;
    globalCache.__mongoose.conn = conn;
    try {
      await reconcileProductIndexes();
    } catch (indexErr) {
      console.error(`Product index reconcile skipped: ${sanitizeMongoError(indexErr.message)}`);
    }
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    globalCache.__mongoose.promise = null;
    globalCache.__mongoose.conn = null;
    const message = sanitizeMongoError(err.message);
    console.error(`MongoDB connection error: ${message}`);
    throw new Error(
      `${message} — In Atlas: Network Access must allow 0.0.0.0/0. In Vercel: MONGO_URI must be the Atlas string (not localhost).`
    );
  }
}
