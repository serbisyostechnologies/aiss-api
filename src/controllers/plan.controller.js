import { createNewPlan } from '../services/plan.service.js';

export const createPlan = async (req, res) => {
  try {
    const plan = await createNewPlan(req.body);
    res.status(201).json({ success: true, message: 'Plan created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};