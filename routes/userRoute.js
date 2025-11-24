import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  getAllUsers,
  getUserById,
  updateProfile,
  changePassword
} from "../controllers/userController.js";

const router = express.Router();

// Get logged-in user
router.get("/me", authenticate, getProfile);

// Update logged-in user profile
router.put("/update", authenticate, updateProfile);

// Change user password
router.put("/change-password", authenticate, changePassword);

// Get all users
router.get("/", authenticate, getAllUsers);

// Get user by ID
router.get("/:id", authenticate, getUserById);

export default router;
