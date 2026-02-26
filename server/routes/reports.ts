import express from 'express';
import { Order } from '../models/Order';
import { ProductionPlan } from '../models/ProductionPlan';
import { QualityCheck } from '../models/QualityCheck';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    // In a real app, these would be aggregated queries
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const activeProduction = await ProductionPlan.countDocuments({ status: 'in_progress' });
    const qualityIssues = await QualityCheck.countDocuments({ passed: false });
    
    // Mock revenue data for chart
    const revenueData = [
      { name: 'Jan', value: 4000 },
      { name: 'Feb', value: 3000 },
      { name: 'Mar', value: 2000 },
      { name: 'Apr', value: 2780 },
      { name: 'May', value: 1890 },
      { name: 'Jun', value: 2390 },
    ];

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        activeProduction,
        qualityIssues
      },
      revenueData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

export default router;
