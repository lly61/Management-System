import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  items: [{
    partNumber: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date }
});

export const Order = mongoose.model('Order', orderSchema);
