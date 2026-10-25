import State from "../models/state.model.js";

export const createStates = async () => {
  const states = [
    { name: "Haryana", code: "HR", type: "STATE", region: "NORTH" },
    { name: "Himachal Pradesh", code: "HP", type: "STATE", region: "NORTH" },
    { name: "Punjab", code: "PB", type: "STATE", region: "NORTH" },
    { name: "Rajasthan", code: "RJ", type: "STATE", region: "NORTH" },
    { name: "Uttar Pradesh", code: "UP", type: "STATE", region: "NORTH" },
    { name: "Uttarakhand", code: "UK", type: "STATE", region: "NORTH" },
    { name: "Andhra Pradesh", code: "AP", type: "STATE", region: "SOUTH" },
    { name: "Karnataka", code: "KA", type: "STATE", region: "SOUTH" },
    { name: "Kerala", code: "KL", type: "STATE", region: "SOUTH" },
    { name: "Tamil Nadu", code: "TN", type: "STATE", region: "SOUTH" },
    { name: "Telangana", code: "TS", type: "STATE", region: "SOUTH" },
    { name: "Bihar", code: "BR", type: "STATE", region: "EAST" },
    { name: "Jharkhand", code: "JH", type: "STATE", region: "EAST" },
    { name: "Odisha", code: "OD", type: "STATE", region: "EAST" },
    { name: "West Bengal", code: "WB", type: "STATE", region: "EAST" },
    { name: "Goa", code: "GA", type: "STATE", region: "WEST" },
    { name: "Gujarat", code: "GJ", type: "STATE", region: "WEST" },
    { name: "Maharashtra", code: "MH", type: "STATE", region: "WEST" },
    { name: "Chhattisgarh", code: "CG", type: "STATE", region: "CENTRAL" },
    { name: "Madhya Pradesh", code: "MP", type: "STATE", region: "CENTRAL" },
    {
      name: "Arunachal Pradesh",
      code: "AR",
      type: "STATE",
      region: "NORTHEAST",
    },
    { name: "Assam", code: "AS", type: "STATE", region: "NORTHEAST" },
    { name: "Manipur", code: "MN", type: "STATE", region: "NORTHEAST" },
    { name: "Meghalaya", code: "ML", type: "STATE", region: "NORTHEAST" },
    { name: "Mizoram", code: "MZ", type: "STATE", region: "NORTHEAST" },
    { name: "Nagaland", code: "NL", type: "STATE", region: "NORTHEAST" },
    { name: "Sikkim", code: "SK", type: "STATE", region: "NORTHEAST" },
    { name: "Tripura", code: "TR", type: "STATE", region: "NORTHEAST" },
    {
      name: "Chandigarh",
      code: "CH",
      type: "UNION_TERRITORY",
      region: "NORTH",
    },
    { name: "Delhi", code: "DL", type: "UNION_TERRITORY", region: "NORTH" },
    {
      name: "Jammu and Kashmir",
      code: "JK",
      type: "UNION_TERRITORY",
      region: "NORTH",
    },
    { name: "Ladakh", code: "LA", type: "UNION_TERRITORY", region: "NORTH" },
    {
      name: "Andaman and Nicobar Islands",
      code: "AN",
      type: "UNION_TERRITORY",
      region: "SOUTH",
    },
    {
      name: "Lakshadweep",
      code: "LD",
      type: "UNION_TERRITORY",
      region: "SOUTH",
    },
    {
      name: "Dadra and Nagar Haveli and Daman and Diu",
      code: "DH",
      type: "UNION_TERRITORY",
      region: "WEST",
    },
    {
      name: "Puducherry",
      code: "PY",
      type: "UNION_TERRITORY",
      region: "SOUTH",
    },
  ];

  return await State.bulkWrite(
    states.map((state) => ({
      updateOne: {
        filter: { code: state.code },
        update: { $set: state },
        upsert: true,
      },
    })),
  );
};

export const getAllStates = async () => {
  return await State.find()
    .select("_id name code type isActive createdAt")
    .sort({ createdAt: -1, type: 1, name: 1 });
};
