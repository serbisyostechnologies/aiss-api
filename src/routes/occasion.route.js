import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createOccasions, getAllOccasions } from "../controllers/occasion.controller.js";

const router = express.Router();

router.post("/seed", authMiddleware, createOccasions);
router.post("/get-all", authMiddleware, getAllOccasions);

export default router;