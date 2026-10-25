import State from "../models/state.model.js";
import Occasion from "../models/occasion.model.js";
import Month from "../models/month.model.js";

export const createOccasions = async () => {
  const occasions = [
    {
      state: [
        "Haryana",
        "Punjab",
        "Rajasthan",
        "Uttar Pradesh",
        "Himachal Pradesh",
      ],
      month: 10,
      date: "2026-10-29",
      name: "Karva Chauth",
    },
    {
      state: ["ALL"],
      month: 11,
      date: "2026-11-06",
      name: "Dhanteras",
    },
    {
      state: ["ALL"],
      month: 11,
      date: "2026-11-08",
      name: "Diwali",
    },
    {
      state: ["Gujarat", "Maharashtra", "Rajasthan", "Uttar Pradesh"],
      month: 11,
      date: "2026-11-09",
      name: "Govardhan Puja",
    },
    {
      state: ["ALL"],
      month: 11,
      date: "2026-11-11",
      name: "Bhai Dooj",
    },
    {
      state: ["Bihar", "Jharkhand", "Uttar Pradesh"],
      month: 11,
      date: "2026-11-15",
      name: "Chhath Puja",
    },
    {
      state: ["Punjab", "ALL"],
      month: 11,
      date: "2026-11-24",
      name: "Guru Nanak Jayanti",
    },
    {
      state: ["Haryana"],
      month: 12,
      date: "2026-12-20",
      name: "Gita Jayanti",
    },
    {
      state: ["Maharashtra", "Karnataka"],
      month: 12,
      date: "2026-12-23",
      name: "Dattatreya Jayanti",
    },
    {
      state: ["ALL"],
      month: 12,
      date: "2026-12-25",
      name: "Christmas",
    },
  ];

  const allStates = await State.find().select("_id name");
  const stateMap = new Map(allStates.map((state) => [state.name, state._id]));

  const allMonths = await Month.find().select("_id name number");
  const monthMap = new Map(allMonths.map((month) => [month.number, month._id]));

  const occasionDocuments = occasions.map((occasion) => {
    const monthId = monthMap.get(occasion.month);
    const stateIds = occasion.state.includes("ALL")
      ? []
      : occasion.state.map((name) => {
          const stateId = stateMap.get(name);

          if (!stateId) {
            throw new Error(`State not found: ${name}`);
          }

          return stateId;
        });

    return {
      state: stateIds,
      month: monthId,
      date: new Date(`${occasion.date}T00:00:00.000Z`),
      name: occasion.name,
    };
  });
  return await Occasion.insertMany(occasionDocuments);
};

export const getAllOccasions = async () => {
  return await Occasion.find()
    .populate("state", "name region")
    .populate("month", "name number")
    .sort({ month: 1, date: 1, name: 1 });
};