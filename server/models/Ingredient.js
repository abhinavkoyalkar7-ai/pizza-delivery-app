import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['base', 'sauce', 'cheese', 'veggies'] 
  },
  price: { type: Number, required: true },
  stock: { type: Number, default: 50 },
  image: { type: String, default: '' },
});

export default mongoose.model('Ingredient', ingredientSchema);