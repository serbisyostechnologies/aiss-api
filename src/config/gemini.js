import { GoogleGenAI } from "@google/genai";
import env from "../config/environment.js";

const geminiAi = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export default geminiAi;