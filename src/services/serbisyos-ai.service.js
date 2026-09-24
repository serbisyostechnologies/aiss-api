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
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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
      size: "1024x1024",
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

const INITIAL_DURATION = 8;
const EXTENSION_DURATION = 7;
const MAX_EXTENSIONS = 20;
const MAX_DURATION = 148;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateExtensions = (duration) => {
  if (duration <= INITIAL_DURATION) {
    return 0;
  }
  return Math.ceil((duration - INITIAL_DURATION) / EXTENSION_DURATION);
};

const waitForOperation = async (operation) => {
  let currentOperation = operation;

  while (!currentOperation.done) {
    console.log("Waiting for Veo...");

    await sleep(10000);

    currentOperation = await geminiAi.operations.getVideosOperation({
      operation: currentOperation,
    });
  }

  return currentOperation;
};

const getVideoFromOperation = (operation) => {
  const generatedVideos = operation?.response?.generatedVideos;

  if (!generatedVideos || generatedVideos.length === 0) {
    throw new Error("Veo did not return a generated video");
  }

  return generatedVideos[0].video;
};

const createContinuationPrompt = ({
  prompt,
  extensionNumber,
  currentDuration,
  duration,
}) => {
  return `
Continue the existing video seamlessly.

Original prompt:
${prompt}

Current video duration:
${currentDuration} seconds

Target duration:
${duration} seconds

Continuation segment:
${extensionNumber}

Instructions:

- Continue directly from the final moment of the existing video.
- Do not restart the scene.
- Preserve the same characters and their appearance.
- Preserve clothing, environment and objects.
- Preserve lighting and color palette.
- Preserve camera style and cinematic look.
- Preserve the same location unless the story naturally moves.
- Continue the existing action naturally.
- Maintain temporal and spatial continuity.
- Do not introduce unrelated characters.
- Do not suddenly change the visual style.
- Make the transition seamless.
- Continue the story from exactly where the previous segment ends.
`;
};

export const generateAiVideo = async ({ userId, prompt, duration = 120 }) => {
  let temporaryFile = null;
  let generation;
  const aspectRatio = "16:9";

  try {
    if (!prompt || !prompt.trim()) {
      throw new Error("Video prompt is required");
    }

    if (duration < 4 || duration > MAX_DURATION) {
      throw new Error(`duration must be between 4 and ${MAX_DURATION} seconds`);
    }

    if (!["16:9", "9:16"].includes(aspectRatio)) {
      throw new Error("aspectRatio must be 16:9 or 9:16");
    }

    const totalExtensions = calculateExtensions(duration);

    if (totalExtensions > MAX_EXTENSIONS) {
      throw new Error(`Maximum extensions allowed: ${MAX_EXTENSIONS}`);
    }

    console.log("====================================");

    console.log("Starting video generation");

    console.log(`Target duration: ${duration}s`);

    console.log(`Extensions: ${totalExtensions}`);

    console.log("====================================");

    /*
     * =====================================
     * INITIAL VIDEO
     * =====================================
     */

    const clearedPrompt = cleanPrompt(prompt);
    console.log("Generating initial 8 second video...");

    const startTime = Date.now();
    let operation = await geminiAi.models.generateVideos({
      model: env.GOOGLE_VEO_VIDEO_MODEL,
      prompt: clearedPrompt,
      config: {
        numberOfVideos: 1,
        durationSeconds: 8,
        resolution: "720p",
        aspectRatio: aspectRatio,
      },
    });

    operation = await waitForOperation(operation);

    let video = getVideoFromOperation(operation);

    let currentDuration = INITIAL_DURATION;

    console.log(`Initial video generated: ${currentDuration}s`);

    /*
     * =====================================
     * EXTENSIONS
     * =====================================
     */

    for (let extension = 1; extension <= totalExtensions; extension++) {
      console.log(`Extending video ${extension}/${totalExtensions}`);

      const continuationPrompt = createContinuationPrompt({
        prompt,
        extensionNumber: extension,
        currentDuration,
        duration,
      });

      let extensionOperation = await geminiAi.models.generateVideos({
        model: env.GOOGLE_VEO_VIDEO_MODEL,
        video: video,
        prompt: continuationPrompt,
        config: {
          numberOfVideos: 1,
          durationSeconds: 8,
          resolution: "720p",
        },
      });

      extensionOperation = await waitForOperation(extensionOperation);
      video = getVideoFromOperation(extensionOperation);
      currentDuration += EXTENSION_DURATION;
      console.log(`Current video duration: ${currentDuration}s`);
      if (currentDuration >= duration) {
        break;
      }
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

    /*
     * =====================================
     * DOWNLOAD FINAL VIDEO
     * =====================================
     */

    console.log("Downloading final Veo video...");

    const uploadDirectory = path.resolve("public", "videos");

    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    const filename = `${randomUUID()}.mp4`;

    temporaryFile = path.join(uploadDirectory, filename);

    await geminiAi.files.download({
      file: video,
      downloadPath: temporaryFile,
    });

    console.log(`Temporary video: ${temporaryFile}`);

    return { videoFile: temporaryFile, generation };
  } catch (error) {
    /*
     * Delete temporary file
     * even when generation/upload fails
     */

    if (temporaryFile) {
      try {
        await fs.unlink(temporaryFile);
      } catch (cleanupError) {
        console.error("Failed to delete temporary file:", cleanupError);
      }
    }

    console.error("Video generation failed:", error);

    throw error;
  }
};