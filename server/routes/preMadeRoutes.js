import express from 'express';
import PreMadePizza from '../models/PreMadePizza.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pizzas = await PreMadePizza.find();
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pizzas' });
  }
});

export default router;