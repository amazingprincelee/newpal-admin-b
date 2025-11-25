// routes/inventoryRoutes.js
import express from 'express';
import {
  getInventory,
  getLowStock,
  getStockSummary,
  updateInventory
} from '../controllers/inventoryController.js'; 

import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router();

// GET all inventory items, sorted by category and product
router.get('/', authenticate, getInventory);

// GET low stock items
router.get('/low-stock', authenticate, getLowStock);

// GET summary of stock per category
router.get('/summary', authenticate, getStockSummary);

// PUT / PATCH update inventory item by ID
router.put('/:id', authenticate, updateInventory); // or router.patch('/:id', updateInventory);

export default router;
