// routes/vendorRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createVendor,
  approveVendor,
  getVendors
} from '../controllers/vendorController.js';

const router = express.Router();

// --- CREATE VENDOR ---
router.post('/', authenticate, createVendor);

// --- GET ALL VENDORS ---
router.get('/', authenticate, getVendors);

// --- APPROVE VENDOR ---
router.patch('/:id/approve', authenticate, approveVendor);

export default router;
