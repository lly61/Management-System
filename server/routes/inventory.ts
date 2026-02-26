import express from 'express';
import { Inventory } from '../models/Inventory';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ lastUpdated: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Error creating item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item' });
  }
});

export default router;
