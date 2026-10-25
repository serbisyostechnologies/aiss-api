import * as promptService from "../services/prompt.service.js";

export const createPrompts = async (req, res) => {
  try {
    const prompts = req.body;

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty JSON array",
      });
    }

    const result = await promptService.createPrompts(prompts);

    return res.status(201).json({
      success: true,
      message: "Prompts processed successfully",
      insertedCount: result.inserted.length,
      skippedCount: result.skipped,
    });
  } catch (error) {
    console.error("Create prompts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save prompts",
    });
  }
};

export const getAllPrompts = async (req, res) => {
  try {
    const prompts = await promptService.getAllPrompts();

    return res.status(200).json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prompts",
    });
  }
};

export const getPrompts = async (req, res) => {
  try {
    const prompts = await promptService.getPrompts(req.body);

    return res.status(200).json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prompts",
    });
  }
}