import express from 'express';
import { QualityCheck } from '../models/QualityCheck';
import { toCSV } from '../utils/csv';

const router = express.Router();

router.get('/export', async (req, res) => {
  try {
    const checks = await QualityCheck.find().sort({ checkDate: -1 }).lean();
    const rows = (checks as any[]).map((c) => ({
      checkId: c.checkId,
      productionPlanId: c.productionPlanId,
      batchNumber: c.batchNumber,
      inspector: c.inspector,
      checkDate: c.checkDate,
      passed: c.passed,
      defectsFound: c.defectsFound ?? '',
      notes: c.notes ?? '',
    }));
    const columns = [
      { key: 'checkId', header: 'Check ID' },
      { key: 'productionPlanId', header: 'Production Plan ID' },
      { key: 'batchNumber', header: 'Batch' },
      { key: 'inspector', header: 'Inspector' },
      { key: 'checkDate', header: 'Check Date' },
      { key: 'passed', header: 'Passed' },
      { key: 'defectsFound', header: 'Defects Found' },
      { key: 'notes', header: 'Notes' },
    ];
    const csv = toCSV(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="quality-checks.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting quality checks' });
  }
});

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
