import express from "express"
import { createAsset, getAssetById, getAssets, updateAsset, deleteAsset } from "../controllers/assetController.js"
import { authenticate } from "../middlewares/authMiddleware.js"


const router = express.Router()


router.post("/", authenticate, createAsset)
router.get("/", authenticate, getAssets)
router.get("/asset/:id", authenticate, getAssetById)
router.put("/asset/:id", authenticate, updateAsset)
router.delete("/asset/:id", authenticate, deleteAsset)



export default router

