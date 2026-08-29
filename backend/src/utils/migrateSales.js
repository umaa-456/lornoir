/* One-time, idempotent migration for campaigns created before numeric
 * discounts and selected products. Back up production before running:
 * npm run migrate:sales
 */
import 'dotenv/config';
import connectDB from '../config/db.js';
import Sale from '../models/Sale.js';

async function migrate() {
  await connectDB();
  const sales = await Sale.collection.find({}).toArray();
  for (const sale of sales) {
    const parsed = Number.parseFloat(String(sale.discount ?? '').replace(/[^0-9.]/g, ''));
    await Sale.collection.updateOne({ _id: sale._id }, { $set: {
      discount: Number.isFinite(parsed) && parsed > 0 && parsed <= 100 ? parsed : 1,
      products: Array.isArray(sale.products) ? sale.products : [],
    } });
  }
  console.log(`Migrated ${sales.length} sale record(s). Assign products in Sale Management before a legacy campaign can affect pricing.`);
  process.exit(0);
}
migrate().catch((error) => { console.error(error); process.exit(1); });
