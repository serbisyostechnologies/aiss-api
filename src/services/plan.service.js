import Plan from "../models/plan.model.js";

export const createNewPlan = async ({
  name,
  code,
  description,
  price,
  credits,
  validityDays,
  allowed,
  oneImageCredit,
  oneVideoCredit,
}) => {
  if (
    [
      name,
      code,
      description,
      price,
      credits,
      validityDays,
      allowed,
      oneImageCredit,
      oneVideoCredit,
    ].some((field) => (typeof(field) == "string" && field?.trim() === ""))
  ) {
    throw new Error("All fields are required");
  }

  const exists = await Plan.findOne({ $and: [{ name }, { code }] });
  if (exists) {
    throw new Error("Plan already exists");
  }

  const plan = await Plan.create({
    name,
    code,
    description,
    price,
    credits,
    validityDays,
    allowed,
    oneImageCredit,
    oneVideoCredit,
  });

  return plan;
};