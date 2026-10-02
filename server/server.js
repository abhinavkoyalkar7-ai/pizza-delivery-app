import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables before routes load
dotenv.config();

import {
  initStockCron,
  checkStockAndAlert,
} from './services/stockAlertService.js';

import authRoutes from './routes/authRoutes.js';
import ingredientRoutes from './routes/ingredientRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import preMadeRoutes from './routes/preMadeRoutes.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pizzas', preMadeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Pizza backend running!',
  });
});

const PORT = process.env.PORT || 5000;

// Start Express server immediately so the event loop stays alive
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');

    // Initialize background cron
    initStockCron();

    // Trigger initial check safely without blocking
    checkStockAndAlert().catch((err) => {
      console.error('Initial stock alert check warning:', err.message);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
  });