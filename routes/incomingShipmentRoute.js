import express from "express";
import {
  createGateEntry,
  updateQC,
  approveIncoming,
  getPendingIncoming
} from "../controllers/incomingShipmentController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE Gate Entry
router.post("/gate-entry", authenticate, createGateEntry);

// UPDATE Quality Control
router.put("/qc/:id", authenticate, updateQC);

// APPROVE Incoming Shipment
router.put("/approve/:id", authenticate, approveIncoming);

// GET Pending Incoming Shipments
router.get("/pending", authenticate, getPendingIncoming);

export default router;
