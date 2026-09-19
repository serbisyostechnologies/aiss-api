import geminiAi from "../config/gemini.js";
import { openai } from "../config/openai.js";
import env from "../config/environment.js";
import { cleanPrompt } from "../utils/prompt-utils.js";
import {
  crateUsagePlan,
  createGeneration,
  validateUserInput,
} from "../utils/utilities.util.js";
import Generation from "../models/generation.model.js";
import { Modality } from "@google/genai";
import sharp from "sharp";

export const generateAiPrompt = async ({ prompt, userId }) => {
  let generation;
  try {
    const result = await validateUserInput(userId, prompt);
    if (result) {
      throw new Error(result);
    }

    const PROMPT_CREDIT_COST = 50;
    const userPlan = await crateUsagePlan(PROMPT_CREDIT_COST, userId);
    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    const clearedPrompt = cleanPrompt(prompt);
    const input = `
        You are an expert AI prompt engineer specializing in image generation.

        Rewrite the user's prompt into a rich, detailed prompt while preserving the original intent.

        Include:
        - subject
        - environment
        - lighting
        - composition
        - camera angle
        - artistic style
        - color palette
        - mood
        - level of detail
        - quality descriptors

        Do not add content that changes the user's intent.

        Return only the improved prompt.

        User Prompt:
        """${clearedPrompt}"""
        `;

    const startTime = Date.now();
    const response = await geminiAi.models.generateContent({
      model: env.GEMINI_PROMPT_MODEL,
      contents: input,
    });
    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    generation = await createGeneration({
      userId,
      type: "prompt",
      operation: "create",
      prompt,
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.GEMINI_PROMPT_MODEL,
      duration: generationTimeSeconds,
      usageData: {
        prompts: 1,
      },
    });

    const improvedPrompt = response.text;
    await Generation.updateGeneration(generation._id, {
      result: improvedPrompt,
      status: "completed",
    });

    return improvedPrompt;
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error("Failed to generate prompt");
  }
};

export const generateAiImage = async ({ prompt, userId }) => {
  let generation;
  try {
    const result = await validateUserInput(userId, prompt);
    if (result) {
      throw new Error(result);
    }

    const PROMPT_CREDIT_COST = 100;
    const userPlan = await crateUsagePlan(PROMPT_CREDIT_COST, userId);
    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    const clearedPrompt = cleanPrompt(prompt);

    const startTime = Date.now();
    const response = await openai.images.generate({
      model: process.env.IMAGE_MINI_MODEL,
      prompt: clearedPrompt.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
      size: '1024x1024',
      quality: "medium",
    });

    if (
      !response ||
      !response.data ||
      !response.data[0] ||
      !response.data[0].b64_json
    ) {
      throw new Error("Failed to generate image");
    }

    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    generation = await createGeneration({
      userId,
      type: "image",
      operation: "create",
      prompt: clearedPrompt,
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.IMAGE_MINI_MODEL,
      duration: generationTimeSeconds,
      usageData: {
        images: 1,
      },
    });

    return { base64Image: response.data[0].b64_json, generation };
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error(error.message);
  }
};

export const editAiImage = async ({ imageBuffer, mime, prompt, userId }) => {
  let generation;
  try {
    const result = await validateUserInput(userId, prompt);
    if (result) {
      throw new Error(result);
    }

    const PROMPT_CREDIT_COST = 100;
    const userPlan = await crateUsagePlan(PROMPT_CREDIT_COST, userId);
    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    const optimizedBuffer = await sharp(imageBuffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    const reqImagePart = {
      inlineData: {
        mimeType: mime,
        data: optimizedBuffer.toString("base64"),
      },
    };

    const clearedPrompt = cleanPrompt(prompt);
    const startTime = Date.now();
    const response = await geminiAi.models.generateContent({
      model: env.GEMINI_IMAGE_MODEL_FLASH,
      contents: [
        {
          role: "user",
          parts: [
            reqImagePart,
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    generation = await createGeneration({
      userId,
      type: "image",
      operation: "edit",
      prompt: clearedPrompt,
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.GEMINI_IMAGE_MODEL_FLASH,
      duration: generationTimeSeconds,
      usageData: {
        images: 1,
      },
    });

    const imagePart = response.candidates[0].content.parts.find(
      (part) => part.inlineData,
    );
    if (!imagePart) {
      throw new Error("No image returned from Gemini");
    }
    const { data: base64Image, mimeType } = imagePart.inlineData;
    return { base64Image, mimeType, generation };
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error("Failed to edit image");
  }
};

export const createAiImageCollage = async ({ files, prompt, userId }) => {
  let generation;
  try {
    if (!files || files.length < 2) {
      throw new Error("Minimum 2 images are required.");
    }

    const result = await validateUserInput(userId, prompt);
    if (result) {
      throw new Error(result);
    }

    const PROMPT_CREDIT_COST = 100;
    const userPlan = await crateUsagePlan(PROMPT_CREDIT_COST, userId);
    if (!userPlan) {
      throw new Error("Insufficient credits");
    }

    const uploadedImages = await Promise.all(
      files.map((file) =>
        geminiAi.files.upload({
          file: file.path,
        }),
      ),
    );

    const imageParts = uploadedImages.map((image) => ({
      fileData: {
        fileUri: image.uri,
        mimeType: image.mimeType,
      },
    }));

    const clearedPrompt = cleanPrompt(prompt);
    const startTime = Date.now();
    const response = await geminiAi.models.generateContent({
      model: env.GEMINI_IMAGE_MODEL_FLASH,
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            {
              text:
                prompt ||
                `Create a beautiful square collage using every uploaded image.
                 Do not remove any image.
                 Keep faces visible.
                 Use a clean white background.
                 Add equal spacing between images.`,
            },
          ],
        },
      ],
    });
    const endTime = Date.now();

    const generationTimeSeconds = Number(
      ((endTime - startTime) / 1000).toFixed(2),
    );

    generation = await createGeneration({
      userId,
      type: "image",
      operation: "collage",
      prompt: clearedPrompt,
      creditsUsed: PROMPT_CREDIT_COST,
      model: env.GEMINI_IMAGE_MODEL_FLASH,
      duration: generationTimeSeconds,
      usageData: {
        images: 1,
      },
    });

    const imagePart = response.candidates[0].content.parts.find(
      (part) => part.inlineData,
    );
    if (!imagePart) {
      throw new Error("No image returned from Gemini");
    }
    const { data: base64Image, mimeType } = imagePart.inlineData;
    return { base64Image, mimeType, generation };
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error("Failed to create image collage");
  }
};