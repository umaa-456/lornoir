import './src/config/network.js';
import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`L'Or Noir API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  if (!process.env.VERCEL) process.exit(1);
});

// On Vercel the serverless handler in api/index.js connects per invocation.
if (!process.env.VERCEL) {
  start();
}
