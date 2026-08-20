import mongoose from 'mongoose';
import Product from '../models/Product.js';

/**
 * The original product collection was deployed with a unique `name` index.
 * A product name is display data, not an identifier: different variants or
 * designs may legitimately share it. Mongoose does not remove indexes that
 * are no longer declared in a schema, so reconcile that legacy index here.
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
  const legacyNameIndexes = indexes.filter((index) =>
    index.unique &&
    Object.keys(index.key).length === 1 &&
    index.key.name === 1
  );

  for (const index of legacyNameIndexes) {
    try {
      await Product.collection.dropIndex(index.name);
      console.log(`Removed obsolete unique products index: ${index.name}`);
    } catch (err) {
      // Multiple application instances can reconcile concurrently. If another
      // instance removed the index first, the desired state has been reached.
      if (err.code !== 27) throw err;
    }
  }

  // Keep the declared unique indexes for product URLs and variant SKUs in
  // place, along with the catalogue query indexes defined on Product.
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
