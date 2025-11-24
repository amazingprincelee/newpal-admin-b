import express from "express";
import { registerUser, loginUSer } from "../controllers/authController.js";
import { registerValidator, loginValidator } from "../middlewares/authValidator.js";


const router = express.Router(); // <-- here you asked for this

// REGISTER
router.post("/register", registerValidator, registerUser);

// LOGIN
router.post("/login", loginValidator, loginUSer);



export default router;
