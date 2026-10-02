import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ingredient from './models/Ingredient.js';

dotenv.config();

const ingredientImages = {
  'Thin Crust': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
  'Cheese Burst': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=300&auto=format&fit=crop&q=80',
  'Gluten-Free': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80',
  'Classic Tomato': 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=300&auto=format&fit=crop&q=80',
  'Barbecue Zing': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&auto=format&fit=crop&q=80',
  'Spicy Peri Peri': 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=300&auto=format&fit=crop&q=80',
  'Mozzarella': 'https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=300&auto=format&fit=crop&q=80',
  'Cheddar': 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=300&auto=format&fit=crop&q=80',
  'Red Onions': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&auto=format&fit=crop&q=80',
  'Jalapenos': 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=300&auto=format&fit=crop&q=80',
  'Black Olives': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&auto=format&fit=crop&q=80',
  'Bell Peppers': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&auto=format&fit=crop&q=80',
};

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    for (const [name, imageUrl] of Object.entries(ingredientImages)) {
      await Ingredient.updateOne(
        { name: new RegExp(`^${name}$`, 'i') },
        { $set: { image: imageUrl } }
      );
    }

    console.log('Ingredient images successfully saved to database!');
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
};

updateImages();