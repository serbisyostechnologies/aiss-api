import {
  generateAiPrompt,
  generateAiImage,
  editAiImage,
  createAiImageCollage,
} from "../services/serbisyos-ai.service.js";
import Generation from "../models/generation.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import fs from "fs/promises";

export const generatePrompt = async (req, res) => {
  try {
    const prompt = await generateAiPrompt(req.body);
    res.status(201).json({
      success: true,
      message: "Prompt generated successfully",
      prompt,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const generateImage = async (req, res) => {
  let gen;
  try {
    const { base64Image, generation } = await generateAiImage(
      req.body,
    );

    gen = generation;
    const imageFile = `data:image/png;base64,${base64Image}`;
    const aiImage = await uploadOnCloudinary(imageFile, "IMAGES");
    const image_url = aiImage.url;

    await Generation.updateGeneration(gen._id, {
      result: image_url,
      status: "completed",
    });

    res.status(201).json({
      success: true,
      message: "Image created successfully",
      image_url,
    });
  } catch (err) {
    console.log(err);
    if (gen) {
      await Generation.updateStatus(gen._id, "failed");
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

export const editImage = async (req, res) => {
  let gen;
  try {
    const { prompt, userId } = req.body;
    const image = req.files?.image?.[0];
    console.log("File path: ", image.path);
    const imageBuffer = await fs.readFile(image.path);
    const { base64Image, mimeType, generation } = await editAiImage({
      imageBuffer: imageBuffer.toString("base64"),
      mime: image.mimetype,
      prompt,
      userId,
    });

    gen = generation;
    const imageFile = `data:${mimeType};base64,${base64Image}`;
    const aiImage = await uploadOnCloudinary(imageFile, "IMAGES");
    const image_url = aiImage.url;

    await Generation.updateGeneration(gen._id, {
      result: image_url,
      status: "completed",
    });

    res.status(201).json({
      success: true,
      message: "Image edited successfully",
      image_url,
    });
  } catch (err) {
    console.log(err);
    if (gen) {
      await Generation.updateStatus(gen._id, "failed");
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createImageCollage = async (req, res) => {
  let gen;
  try {
    const { prompt, userId } = req.body;
    const { base64Image, mimeType, generation } = await createAiImageCollage({
      files: req.files?.images,
      prompt,
      userId,
    });

    gen = generation;
    const imageFile = `data:${mimeType};base64,${base64Image}`;
    const aiImage = await uploadOnCloudinary(imageFile, "IMAGES");
    const image_url = aiImage.url;

    await Generation.updateGeneration(gen._id, {
      result: image_url,
      status: "completed",
    });

    res.status(201).json({
      success: true,
      message: "Image edited successfully",
      image_url,
    });
  } catch (err) {
    console.log(err);
    if (gen) {
      await Generation.updateStatus(gen._id, "failed");
    }
    res.status(400).json({ success: false, message: err.message });
  }
};