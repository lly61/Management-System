import express from 'express';
import { Inventory } from '../models/Inventory';
import { toCSV } from '../utils/csv';

const router = express.Router();

router.get('/export', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ lastUpdated: -1 }).lean();
    const columns = [
      { key: 'partNumber', header: 'Part Number' },
      { key: 'name', header: 'Name' },
      { key: 'category', header: 'Category' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'minStockLevel', header: 'Min Stock' },
      { key: 'location', header: 'Location' },
      { key: 'supplier', header: 'Supplier' },
      { key: 'unitPrice', header: 'Unit Price' },
      { key: 'lastUpdated', header: 'Last Updated' },
    ];
    const csv = toCSV(items as any[], columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting inventory' });
  }
});

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
