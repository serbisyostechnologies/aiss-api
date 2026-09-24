import express from 'express';
import { newContact } from '../controllers/contact.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/create-new-contact', authMiddleware, authMiddleware, newContact);

export default router;