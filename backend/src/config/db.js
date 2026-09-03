import mongoose from 'mongoose';
import Product from '../models/Product.js';

/**
 * Product display and merchandising data is deliberately non-unique. MongoDB
 * retains indexes after a schema changes, so remove legacy unique Product
 * indexes at startup. `slug` is the sole exception: it is an internal route
 * identifier and the Product hook guarantees a unique value for it.
 */
async function reconcileProductIndexes() {
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

  // Recreate the declared slug and catalogue query indexes after cleanup.
  await Product.createIndexes();
}

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    await reconcileProductIndexes();
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}
