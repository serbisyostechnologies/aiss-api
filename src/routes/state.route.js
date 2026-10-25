import express from "express";
import { createStates, getAllStates } from "../controllers/state.controller.js";

const router = express.Router();

router.post("/seed", createStates);
router.post("/get-all", getAllStates);

export default router;