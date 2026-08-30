import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Backfills the new variant totalStock field without changing available stock.
// Existing active orders are included so the console correctly shows
// total = currently available + units already reserved/sold.
async function migrateInventory() {
  await connectDB();
  const activeOrders = await Order.find({ status: { $ne: 'cancelled' } }).select('items').lean();
  const consumed = new Map();
  for (const order of activeOrders) {
    for (const item of order.items || []) {
      const key = `${item.product}:${item.sku}`;
      consumed.set(key, (consumed.get(key) || 0) + Number(item.qty || 0));
    }
  }

  const products = await Product.find();
  let updated = 0;
  for (const product of products) {
    let changed = false;
    for (const variant of product.variants || []) {
      if (variant.totalStock === null || variant.totalStock === undefined) {
        const key = `${product._id}:${variant.sku}`;
        variant.totalStock = Number(variant.stock || 0) + (consumed.get(key) || 0);
        changed = true;
      }
    }
    if (changed) {
      await product.save();
      updated += 1;
    }
  }

  // Legacy cancelled orders may already have been restored by the previous
  // customer-cancel endpoint. Marking them as handled prevents any future
  // reactivation/delete operation from treating old history as new work.
  await Order.updateMany(
    { status: 'cancelled', inventoryReleased: { $exists: false } },
    { $set: { inventoryReleased: true } }
  );
  console.log(`Inventory migration complete: ${updated} product(s) backfilled.`);
  await mongoose.disconnect();
}

migrateInventory().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
