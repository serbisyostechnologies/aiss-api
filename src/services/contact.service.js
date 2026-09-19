import Contact from "../models/contact.model.js";

const createNewContact = async ({ name, email, mobile, subject, message }) => {
  if (
    [name, email, mobile, subject, message].some(
      (field) => field?.trim() === "",
    )
  ) {
    throw new Error("All fields are required");
  }

  const contact = await Contact.create({ name, email, mobile, subject, message });

  if (!contact) {
    throw new Error("Contact message: Failed to send message");
  }

  return contact;
};

export { createNewContact };