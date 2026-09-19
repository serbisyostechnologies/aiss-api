import fs from "fs";
import path from "path";

const tempDir =
  process.env.VERCEL === "1"
    ? "/tmp"
    : path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export default tempDir;