import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadOnCloudinary = async (localFilePath, folder) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: `aistudio_uploads/${folder}`,
    });

    if (!localFilePath.startsWith("data:") && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return response;
  } catch (error) {
    console.log(error);
    if (!localFilePath.startsWith("data:") && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const uploadBuffer = (buffer, folder = "AIImages") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `aistudio_uploads/${folder}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export { uploadOnCloudinary, uploadBuffer };