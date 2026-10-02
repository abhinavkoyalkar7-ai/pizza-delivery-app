import mongoose from 'mongoose';

const preMadePizzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  badge: { type: String, default: 'Popular' } // e.g. 'Bestseller', 'Chef Special', 'Spicy'
});

export default mongoose.model('PreMadePizza', preMadePizzaSchema);