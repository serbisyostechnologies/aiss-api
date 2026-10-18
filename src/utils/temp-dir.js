import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

await createTempDirectory();

const tempDir =
  process.env.VERCEL === "1"
    ? "/tmp"
    : path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function createTempDirectory() {
  const tempDir = path.join(os.tmpdir(), `aiss-${crypto.randomUUID()}`);

  await fs.mkdir(tempDir, { recursive: true });
}

export default tempDir;