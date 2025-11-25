// routes/visitorEntryRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createVisitorEntry,
  approveVisitor,
  checkOutVisitor
} from '../controllers/visitorEntryController.js';

const router = express.Router();

// --- CREATE VISITOR ENTRY ---
router.post('/', authenticate, createVisitorEntry);

// --- APPROVE VISITOR ENTRY ---
router.patch('/:id/approve', authenticate, approveVisitor);

// --- CHECK OUT VISITOR ---
router.patch('/:id/checkout', authenticate, checkOutVisitor);

export default router;
