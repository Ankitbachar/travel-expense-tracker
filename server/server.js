require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const expenseRoutes = require('./routes/expenses');

const app = express();
// In production set CLIENT_URL to your frontend URL (e.g. https://trip-split.vercel.app)
app.use(cors(process.env.CLIENT_URL ? { origin: process.env.CLIENT_URL } : undefined));
app.use(express.json());

app.use('/api/expenses', (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected yet. Check MONGO_URI and Atlas Network Access.' });
  }
  next();
});

app.use('/api/expenses', expenseRoutes);
// Health check also reports the database state (0=disconnected, 1=connected, 2=connecting)
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' })
);

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
const MONGO_URI =
  process.env.MONGO_URI || (isProd ? '' : 'mongodb://127.0.0.1:27017/travel-expense-tracker');

if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Add it in your host\'s environment variables (use your MongoDB Atlas connection string).');
  process.exit(1);
}

if (isProd && /(127\.0\.0\.1|localhost)/.test(MONGO_URI)) {
  console.error('MONGO_URI points to localhost. In production it must be your MongoDB Atlas string (mongodb+srv://...).');
  process.exit(1);
}

// Open the port right away so hosts like Render detect the service,
// then connect to MongoDB in the background.
app.listen(PORT, '0.0.0.0', () => console.log(`API listening on port ${PORT}`));

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });