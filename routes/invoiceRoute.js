// routes/invoiceRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createInvoice,
  addPayment,
  getOverdueInvoices
} from '../controllers/invoiceController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new invoice
router.post('/', createInvoice);

// Add a payment to an invoice by ID
router.post('/:id/payment', addPayment);

// Get all overdue invoices
router.get('/overdue', getOverdueInvoices);

export default router;
