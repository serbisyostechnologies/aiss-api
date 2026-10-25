import express from "express";
import { createMonths, getAllMonths } from "../controllers/month.controller.js";

const router = express.Router();

router.post("/seed", createMonths);
router.post("/get-all", getAllMonths);

export default router;