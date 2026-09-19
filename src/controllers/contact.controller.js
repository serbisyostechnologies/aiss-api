import {
  createNewContact,
} from '../services/contact.service.js';

export const newContact = async (req, res) => {
  try {
    const contact = await createNewContact(req.body);
    res.status(201).json({ success: true, message: 'Contact message sent successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};