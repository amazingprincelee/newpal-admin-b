import express from "express";
import { registerUser, loginUSer, getProfile } from "../controllers/authController.js";
import { registerValidator, loginValidator } from "../middlewares/authValidator.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router(); // <-- here you asked for this

// REGISTER
router.post("/register", registerValidator, registerUser);

// LOGIN
router.post("/login", loginValidator, loginUSer);

// GET CURRENT USER PROFILE (Protected)
router.get("/me", authenticate, getProfile);

export default router;
