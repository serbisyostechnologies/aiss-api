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

export const generateAiImage = async ({ prompt, userId, imageSize }) => {
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
      model: env.OPEN_AI_IMAGE_MODEL,
      prompt: clearedPrompt.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
      size: imageSize,
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
      model: env.OPEN_AI_IMAGE_MODEL,
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

export const editAiImage = async ({ imageFile, userId, prompt, imageSize }) => {
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
    const response = await openai.images.edit({
      model: env.OPEN_AI_IMAGE_MODEL,
      image: imageFile,
      prompt: `
        Edit the uploaded image according to this instruction:
        ${clearedPrompt.trim()}

        IMPORTANT PRESERVATION RULES:
        - Preserve every person's original identity and facial likeness.
        - Do not regenerate, redraw, beautify, or alter faces.
        - Keep eyes, nose, lips, face shape, skin tone, and expression unchanged.
        - Preserve original hair, body proportions, pose, and clothing
          unless explicitly requested otherwise.
        - Change only the specific elements requested by the user.
        - Keep all other parts of the original image unchanged.
        - Maintain realistic lighting and natural integration.
      `,
      quality: "medium",
      size: imageSize,
      output_format: "png",
      input_fidelity: "high",
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
      model: env.OPEN_AI_IMAGE_MODEL,
      duration: generationTimeSeconds,
      usageData: {
        images: 1,
      },
    });

    return { b64_json: response.data?.[0]?.b64_json, generation };
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error(error.message);
  }
};

export const createAiImageCollage = async ({
  imageFiles,
  userId,
  prompt,
  imageSize,
}) => {
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

    const collagePrompt = `
      Create a polished image collage using all the supplied reference images.

      User instructions: ${clearedPrompt}
      Layout: "creative grid"
      Visual style: "modern"

      Requirements:
      - Incorporate every supplied reference image.
      - Arrange the images into one cohesive collage.
      - Use balanced spacing, clean composition, and consistent colors.
      - Avoid unnecessary text, watermarks, and decorative clutter.
      - Produce one finished image, not a collection of separate images.
      - Preserve recognizable subjects as closely as possible.
    `;

    const startTime = Date.now();

    const response = await openai.images.edit({
      model: env.OPEN_AI_IMAGE_MODEL,
      image: imageFiles,
      prompt: collagePrompt,
      quality: "medium",
      size: imageSize,
      output_format: "png",
      input_fidelity: "high",
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
      model: env.OPEN_AI_IMAGE_MODEL,
      duration: generationTimeSeconds,
      usageData: {
        images: 1,
      },
    });

    return { b64_json: response.data?.[0]?.b64_json, generation };
  } catch (error) {
    if (generation) {
      await Generation.updateStatus(generation._id, "failed");
    }
    console.error(error);

    throw new Error(error.message);
  }
};