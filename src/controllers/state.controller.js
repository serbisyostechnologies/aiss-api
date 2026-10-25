import * as stateService from "../services/state.service.js";

export const createStates = async (req, res) => {
  try {
    const result = await stateService.createStates();

    res.status(201).json({
      success: true,
      message: "States added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllStates = async (req, res) => {
  try {
    const states = await stateService.getAllStates();

    return res.status(200).json({
      success: true,
      data: states,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch states",
    });
  }
};