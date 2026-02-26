import express from 'express';
import { ProductionPlan } from '../models/ProductionPlan';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const plans = await ProductionPlan.find().sort({ startDate: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching production plans' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newPlan = new ProductionPlan(req.body);
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating production plan' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedPlan = await ProductionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating production plan' });
  }
});

export default router;
