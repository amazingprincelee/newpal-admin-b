// routes/productionBatchRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createProductionBatch,
  getAllBatches,
  getBatchById,
  approveBatch,
  rejectBatch,
  startBatch,
  completeBatch,
  updateQC,
  deleteBatch
} from '../controllers/productionBatchController.js';

const router = express.Router();

// --- CREATE ---
router.post('/', authenticate, createProductionBatch);

// --- READ ---
router.get('/', authenticate, getAllBatches);          // List all batches
router.get('/:id', authenticate, getBatchById);       // Get a single batch

// --- APPROVAL ---
router.patch('/:id/approve', authenticate, approveBatch);
router.patch('/:id/reject', authenticate, rejectBatch);

// --- PRODUCTION ---
router.patch('/:id/start', authenticate, startBatch);
router.patch('/:id/complete', authenticate, completeBatch);

// --- QC ---
router.patch('/:id/qc', authenticate, updateQC);

// --- DELETE ---
router.delete('/:id', authenticate, deleteBatch);

export default router;
