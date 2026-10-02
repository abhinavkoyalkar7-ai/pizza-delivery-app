
import express from 'express';
import Ingredient from '../models/Ingredient.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all ingredients (for the pizza builder)
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update stock/inventory
// PUT /api/ingredients/:id/stock
router.put('/:id/stock', protect, adminOnly, async (req, res) => {
  try {
    const { stock } = req.body;

    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true }
    );

    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;