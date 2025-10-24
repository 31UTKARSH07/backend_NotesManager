import cloudinary from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProfileImageCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "profile_images",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    // Handle both buffer and file path cases
    if (file?.buffer) {
      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    } else if (file?.path) {
      fs.createReadStream(file.path).pipe(uploadStream);
    } else {
      reject(new Error("No valid file data provided."));
    }
  });
};
