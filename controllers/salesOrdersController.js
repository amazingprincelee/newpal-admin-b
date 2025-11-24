// controllers/salesOrderController.js
import SalesOrder from '../models/salesOrder.js';
import { generateSONumber } from '../utils/numberGenerators.js';

export const createSalesOrder = async (req, res) => {
  try {
    const orderNumber = await generateSONumber();

    const order = new SalesOrder({
      orderNumber,
      ...req.body,
      createdBy: req.user.id
    });

    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveSalesOrder = async (req, res) => {
  try {
    const order = await SalesOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.mdApproval.status = 'APPROVED';
    order.mdApproval.approvedBy = req.user.id;
    order.mdApproval.approvedAt = new Date();
    order.status = 'Approved';
    await order.save();
    res.json({ success: true, message: 'Sales order approved', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingSalesOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find({ 'mdApproval.status': 'PENDING' }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};