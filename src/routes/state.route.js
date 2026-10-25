import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createStates, getAllStates } from "../controllers/state.controller.js";

const router = express.Router();

router.post("/seed", authMiddleware, createStates);
router.post("/get-all", authMiddleware, getAllStates);

export default router;