import { createClient } from "redis";
import env from "./environment.js";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const connectRedis = async () => {
  try {
    const redisClient = createClient();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    console.log("✅ Redis Connected");
  } catch (err) {
    console.error("❌ Redis Connection Failed");
    console.error(err);
  }
};