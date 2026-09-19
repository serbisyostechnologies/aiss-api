import express from 'express';
import { newContact } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/create-new-contact', newContact);

export default router;