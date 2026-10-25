import * as occasionService from "../services/occasion.service.js";

export const createOccasions = async (req, res) => {
  try {
    const result = await occasionService.createOccasions();

    res.status(201).json({
      success: true,
      message: "Occasion added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllOccasions = async (req, res) => {
  try {
    const occasions = await occasionService.getAllOccasions();

    return res.status(200).json({
      success: true,
      data: occasions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch occasions",
    });
  }
};