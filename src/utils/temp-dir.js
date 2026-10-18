import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const tempDir =
  process.env.VERCEL === "1"
    ? os.tmpdir()
    : path.join(process.cwd(), "public", "temp");

await fs.mkdir(tempDir, { recursive: true });

export async function createTempDirectory() {
  const dir = path.join(tempDir, `upload-${crypto.randomUUID()}`);

  await fs.mkdir(dir, { recursive: true });

  return dir;
}

export default tempDir;