import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Native Node.js File System module to handle local files

// 1. Configure Cloudinary credentials from your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. High-order helper function to upload files safely
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detects whether it is an image, video, or audio file
    });

    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);

    // File has been uploaded successfully, remove the local temporary file
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // If the upload failed, we MUST clean up the corrupt/half-uploaded local file from our server disk
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed

    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

export { uploadOnCloudinary };
