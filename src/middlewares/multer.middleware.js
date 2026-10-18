import multer from "multer";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      if (!req.tempUploadDir) {
        req.tempUploadDir = path.join(
          os.tmpdir(),
          `aiss-${crypto.randomUUID()}`,
        );

        await fs.mkdir(req.tempUploadDir, {
          recursive: true,
        });
      }

      cb(null, req.tempUploadDir);
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4 MB per image
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }

    cb(null, true);
  },
});