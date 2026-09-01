import express from 'express';
import Sale from '../models/Sale.js';

const router = express.Router();

// GET sales for a specific date
router.get('/', async (req, res) => {
  try {
    const { date } = req.query; // Expected format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Parse the date and create start and end of day
    const [year, month, day] = date.split('-');
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Query sales within the date range
    const sales = await Sale.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new sale
router.post('/', async (req, res) => {
  try {
    const { name, price, image } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const sale = new Sale({
      name,
      price: parseFloat(price),
      image: image || null,
      createdAt: new Date(),
    });

    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update a sale
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const sale = await Sale.findByIdAndUpdate(
      id,
      {
        name,
        price: parseFloat(price),
        image: image || null,
      },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a sale
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({ message: 'Sale deleted', sale });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
