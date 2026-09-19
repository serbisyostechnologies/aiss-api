import express from 'express';
import { login, logout, updatePassword } from '../controllers/auth.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/update-password', updatePassword);

export default router;