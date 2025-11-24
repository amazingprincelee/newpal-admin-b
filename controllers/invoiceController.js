// controllers/invoiceController.js
import Invoice from '../models/invoice.js';
import SalesOrder from '../models/salesOrder.js';

export const createInvoice = async (req, res) => {
  try {
    const { customer, salesOrder, items } = req.body;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;

    const invoice = new Invoice({
      invoiceNumber,
      customer,
      salesOrder,
      items,
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days
    });

    await invoice.save();

    // Link back to SalesOrder
    await SalesOrder.findByIdAndUpdate(salesOrder, { invoice: invoice._id });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    invoice.payments.push({
      amount: req.body.amount,
      method: req.body.method,
      reference: req.body.reference,
      receivedBy: req.user.id,
      notes: req.body.notes
    });
    invoice.amountPaid += req.body.amount;
    await invoice.save();

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOverdueInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ paymentStatus: 'Overdue' }).sort({ dueDate: 1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};