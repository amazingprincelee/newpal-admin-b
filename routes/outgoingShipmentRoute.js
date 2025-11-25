// routes/outgoingShipmentRoutes.js
import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  createOutgoingShipment,
  approveOutgoing,
  gateOutVerify,
  confirmDelivery
} from '../controllers/outgoingShipment.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new outgoing shipment
router.post('/', createOutgoingShipment);

// Approve outgoing shipment by MD
router.post('/:id/approve', approveOutgoing);

// Gate out verification by security
router.post('/:id/gate-out', gateOutVerify);

// Confirm delivery of shipment
router.post('/:id/delivery', confirmDelivery);

export default router;
