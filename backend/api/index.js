import '../src/config/network.js';
import 'dotenv/config';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error:', error);
    if (res.headersSent) return;
    return res.status(503).json({
      success: false,
      message:
        error.message ||
        'Database unavailable. Set MONGO_URI to Atlas and allow Network Access 0.0.0.0/0.',
    });
  }

  return app(req, res);
}
