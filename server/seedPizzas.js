import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PreMadePizza from './models/PreMadePizza.js';

dotenv.config();

const pizzas = [
  {
    name: 'Margherita Classic',
    description: 'Fresh basil leaves, signature tomato sauce, and molten mozzarella cheese.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80',
    badge: 'Classic'
  },
  {
    name: 'Double Cheese Margherita',
    description: 'Loaded with double layers of mozzarella and cheddar on a crispy golden crust.',
    price: 389,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=80',
    badge: 'Bestseller'
  },
  {
    name: 'Peppy Paneer & Veggie',
    description: 'Chunky paneer, crisp capsicum, and spicy red paprika with fiery sauce.',
    price: 449,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
    badge: 'Chef Special'
  },
  {
    name: 'Veggie Paradise Delight',
    description: 'Golden corn, black olives, sliced jalapenos, and bell peppers.',
    price: 419,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    badge: 'Popular'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await PreMadePizza.deleteMany();
    await PreMadePizza.insertMany(pizzas);
    console.log('Pre-made pizzas seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed:', err);
    process.exit(1);
  }
};

seedDB();