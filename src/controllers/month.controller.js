import * as monthService from "../services/month.service.js";

export const createMonths = async (req, res) => {
  try {
    const result = await monthService.createMonths();

    res.status(201).json({
      success: true,
      message: "Months added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllMonths = async (req, res) => {
  try {
    const states = await monthService.getAllMonths();

    return res.status(200).json({
      success: true,
      data: states,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch months",
    });
  }
};