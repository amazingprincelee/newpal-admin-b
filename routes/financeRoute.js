import express from "express";
import {
  viewPaystackBalance,
  requestWithdrawal,
  approveWithdrawal
} from "../controllers/financeController.js";
import { authenticate } from "../middlewares/authMiddleware.js";


const router = express.Router();

/* ----------------------- FINANCE ROUTES ----------------------- */

// Finance can see Paystack wallet balance
router.get(
  "/paystack/balance",
  authenticate,
  viewPaystackBalance
);

// Finance can make withdrawal request
router.post(
  "/withdraw/request",
  authenticate,
  requestWithdrawal
);

/* ----------------------- ADMIN ROUTES ----------------------- */

// Super-admin approves withdrawal request
router.put(
  "/withdraw/approve/:id",
  authenticate,
  approveWithdrawal
);

export default router;
