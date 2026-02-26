import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  partNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., Engine, Chassis, Electronics
  quantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  location: { type: String }, // Warehouse location
  supplier: { type: String },
  unitPrice: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
});

export const Inventory = mongoose.model('Inventory', inventorySchema);
