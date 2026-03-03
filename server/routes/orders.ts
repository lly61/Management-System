import express from 'express';
import { Order } from '../models/Order';
import { toCSV } from '../utils/csv';

const router = express.Router();

router.get('/export', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }).lean();
    const rows = orders.map((o: any) => ({
      orderId: o.orderId,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      status: o.status,
      orderDate: o.orderDate,
      deliveryDate: o.deliveryDate ?? '',
    }));
    const columns = [
      { key: 'orderId', header: 'Order ID' },
      { key: 'customerName', header: 'Customer' },
      { key: 'totalAmount', header: 'Total Amount' },
      { key: 'status', header: 'Status' },
      { key: 'orderDate', header: 'Order Date' },
      { key: 'deliveryDate', header: 'Delivery Date' },
    ];
    const csv = toCSV(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting orders' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order' });
  }
});

export default router;
