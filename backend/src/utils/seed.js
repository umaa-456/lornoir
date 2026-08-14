import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import slugify from 'slugify';

const BRANDS = [
  { name: "L'Or Noir Atelier", tier: 'House' },
  { name: 'Rêverie', tier: 'Contemporary' },
  { name: 'Al Dahab', tier: 'Oud Specialist' },
  { name: 'Maison Cendre', tier: 'Niche' },
];

const CATEGORIES = ['Oud & Amber', 'Woody', 'Attar', 'Floral', 'Leather', 'Gourmand', 'Incense'];

async function seed() {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@lornoir.com';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      name: 'Maison Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log('Admin user already exists — skipping');
  }

  for (const brand of BRANDS) {
  await Brand.updateOne(
    { name: brand.name },
    {
      $setOnInsert: {
        ...brand,
        slug: slugify(brand.name, { lower: true, strict: true }),
      },
    },
    { upsert: true }
  );
}
  console.log(`Seeded ${BRANDS.length} brands`);

  for (const name of CATEGORIES) {
  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  await Category.updateOne(
    { name },
    {
      $set: {
        slug,
      },
      $setOnInsert: {
        name,
      },
    },
    { upsert: true }
  );
}
  console.log(`Seeded ${CATEGORIES.length} categories`);

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
