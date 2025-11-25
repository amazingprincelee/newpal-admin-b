// routes/salesOrderRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createSalesOrder,
  approveSalesOrder,
  getPendingSalesOrders
} from '../controllers/salesOrdersController.js';

const router = express.Router();

// --- CREATE ---
router.post('/', authenticate, createSalesOrder);

// --- READ ---
router.get('/pending', authenticate, getPendingSalesOrders); // Get all pending sales orders

// --- APPROVAL ---
router.patch('/:id/approve', authenticate, approveSalesOrder);

export default router;
