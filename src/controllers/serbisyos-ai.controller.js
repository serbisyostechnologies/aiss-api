import {
  generateAiPrompt,
  generateAiImage,
  editAiImage,
  createAiImageCollage,
  generateAiVideo,
} from "../services/serbisyos-ai.service.js";
import Generation from "../models/generation.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import fs from "fs";
import { toFile } from "openai";
import path from "path";

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
    const { base64Image, generation } = await generateAiImage(req.body);

    gen = generation;
    const imageFile = `data:image/png;base64,${base64Image}`;
    const aiImage = await uploadOnCloudinary(imageFile, "IMAGES");
    const image_url = aiImage.secure_url;

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
    console.log(req.files.image);
    console.log(req.body);

    if (req.files.image.length == 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }
    const original = req.files.image[0];
    const extension = path.extname(original.originalname).toLowerCase();

    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };

    const mimeType = mimeTypes[extension];
    if (!mimeType) {
      throw new Error("Only JPG, PNG, and WebP images are supported.");
    }

    if (!fs.existsSync(original.path)) {
      throw new Error("Uploaded image file was not found.");
    }

    const imageFile = await toFile(
      fs.createReadStream(original.path),
      original.originalname,
      {
        type: mimeType,
      },
    );
    const { prompt, userId, imageSize } = req.body;

    const { b64_json, generation } = await editAiImage({
      imageFile,
      userId,
      prompt,
      imageSize
    });
    gen = generation;

    const image = `data:image/png;base64,${b64_json}`;
    const aiImage = await uploadOnCloudinary(image, "IMAGES");
    const image_url = aiImage.secure_url;

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

export const generateVideo = async (req, res) => {
  let gen;
  try {
    const { videoFile, generation } = await generateAiVideo(req.body);
    gen = generation;

    const aiImage = await uploadOnCloudinary(videoFile, "VIDEOS");
    const video_url = aiImage.url;

    await Generation.updateGeneration(gen._id, {
      result: video_url,
      status: "completed",
    });

    res.status(201).json({
      success: true,
      message: "Video created successfully",
      video_url,
    });
  } catch (err) {
    console.log(err);
    if (gen) {
      await Generation.updateStatus(gen._id, "failed");
    }
    res.status(400).json({ success: false, message: err.message });
  }
};