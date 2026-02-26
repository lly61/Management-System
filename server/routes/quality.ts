import express from 'express';
import { QualityCheck } from '../models/QualityCheck';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const checks = await QualityCheck.find().sort({ checkDate: -1 });
    res.json(checks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quality checks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newCheck = new QualityCheck(req.body);
    await newCheck.save();
    res.status(201).json(newCheck);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quality check' });
  }
});

export default router;
