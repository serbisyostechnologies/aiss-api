import Month from "../models/month.model.js";

export const createMonths = async () => {
  const months = [
    { name: "January", number: 1 },
    { name: "February", number: 2 },
    { name: "March", number: 3 },
    { name: "April", number: 4 },
    { name: "May", number: 5 },
    { name: "June", number: 6 },
    { name: "July", number: 7 },
    { name: "August", number: 8 },
    { name: "September", number: 9 },
    { name: "October", number: 10 },
    { name: "November", number: 11 },
    { name: "December", number: 12 },
  ];

  return await Month.insertMany(months);
};

export const getAllMonths = async () => {
  return await Month.find()
    .select("_id name number createdAt")
    .sort({ number: 1 });
};