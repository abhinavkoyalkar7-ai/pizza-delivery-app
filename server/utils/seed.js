import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ingredient from '../models/Ingredient.js';

dotenv.config();

const defaultIngredients = [
  // 5 Bases
  { name: 'Thin Crust', category: 'base', price: 120, stock: 25 },
  { name: 'Thick Pan', category: 'base', price: 140, stock: 25 },
  { name: 'Cheese Burst', category: 'base', price: 190, stock: 20 },
  { name: 'Whole Wheat', category: 'base', price: 150, stock: 15 },
  { name: 'Gluten-Free', category: 'base', price: 180, stock: 10 },

  // 5 Sauces
  { name: 'Classic Marinara', category: 'sauce', price: 30, stock: 30 },
  { name: 'Spicy Peri-Peri', category: 'sauce', price: 40, stock: 30 },
  { name: 'Creamy Garlic Alfredo', category: 'sauce', price: 50, stock: 25 },
  { name: 'Barbecue Zing', category: 'sauce', price: 45, stock: 20 },
  { name: 'Pesto Basil', category: 'sauce', price: 60, stock: 15 },

  // Cheeses
  { name: 'Mozzarella', category: 'cheese', price: 70, stock: 30 },
  { name: 'Cheddar', category: 'cheese', price: 80, stock: 20 },
  { name: 'Parmesan', category: 'cheese', price: 90, stock: 15 },
  { name: 'Vegan Almond Cheese', category: 'cheese', price: 110, stock: 10 },

  // Veggies
  { name: 'Black Olives', category: 'veggie', price: 35, stock: 40 },
  { name: 'Jalapenos', category: 'veggie', price: 35, stock: 40 },
  { name: 'Bell Peppers', category: 'veggie', price: 25, stock: 50 },
  { name: 'Red Onions', category: 'veggie', price: 20, stock: 50 },
  { name: 'Grilled Mushrooms', category: 'veggie', price: 40, stock: 30 },
  { name: 'Sweet Corn', category: 'veggie', price: 25, stock: 45 }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    await Ingredient.deleteMany({});
    await Ingredient.insertMany(defaultIngredients);
    console.log('✅ 5 Bases, 5 Sauces, Cheeses, and Veggies seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedDB();