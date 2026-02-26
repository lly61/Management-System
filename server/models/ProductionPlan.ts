import mongoose from 'mongoose';

const productionPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true },
  partNumber: { type: String, required: true },
  targetQuantity: { type: Number, required: true },
  completedQuantity: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['planned', 'in_progress', 'completed', 'delayed'], default: 'planned' },
  assignedLine: { type: String }
});

export const ProductionPlan = mongoose.model('ProductionPlan', productionPlanSchema);
