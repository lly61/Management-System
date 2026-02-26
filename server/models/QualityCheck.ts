import mongoose from 'mongoose';

const qualityCheckSchema = new mongoose.Schema({
  checkId: { type: String, required: true, unique: true },
  productionPlanId: { type: String, required: true },
  batchNumber: { type: String, required: true },
  inspector: { type: String, required: true },
  checkDate: { type: Date, default: Date.now },
  passed: { type: Boolean, required: true },
  defectsFound: { type: Number, default: 0 },
  notes: { type: String }
});

export const QualityCheck = mongoose.model('QualityCheck', qualityCheckSchema);
