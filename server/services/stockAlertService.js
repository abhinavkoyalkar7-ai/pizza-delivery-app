import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Ingredient from '../models/Ingredient.js';

const sendLowStockEmail = async (lowStockItems) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemsFormatted = lowStockItems
    .map((item) => `• ${item.name} (${item.category}): only ${item.stock} left in stock`)
    .join('\n');

  const mailOptions = {
    from: `"PizzaCraft System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: '⚠️ Alert: Ingredient Stock Low',
    text: `Admin notice: The following items are below the safety threshold (${process.env.LOW_STOCK_THRESHOLD || 20} units):\n\n${itemsFormatted}\n\nRestock via Admin Dashboard: http://localhost:5173/admin`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Low-stock alert email sent successfully.');
  } catch (err) {
    console.error('Email alert error:', err.message);
  }
};

export const checkStockAndAlert = async () => {
  try {
    const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || 20;
    const lowStockItems = await Ingredient.find({ stock: { $lt: threshold } });

    if (lowStockItems.length > 0) {
      console.log(`Found ${lowStockItems.length} low-stock items. Sending alert...`);
      await sendLowStockEmail(lowStockItems);
    } else {
      console.log('All ingredients have adequate stock levels.');
    }
  } catch (err) {
    console.error('Inventory check failed:', err.message);
  }
};

export const initStockCron = () => {
  cron.schedule('0 * * * *', () => {
    console.log('Running automated hourly stock check...');
    checkStockAndAlert();
  });
};