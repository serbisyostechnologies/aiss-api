import express from "express";
import { createOccasions, getAllOccasions } from "../controllers/occasion.controller.js";

const router = express.Router();

router.post("/seed", createOccasions);
router.post("/get-all", getAllOccasions);

export default router;