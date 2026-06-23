import multer from "multer";
import configureCloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadToCloudinary = (folder) => async (req, res, next) => {
  if (!req.file) return next();
  const cloudinary = configureCloudinary();
  try {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `lgardeduc/${folder}`,
        transformation: [{ width: 800, quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        console.log("cloudinary error:", error);
        console.log("cloudinary result:", result);
        if (error) return res.status(500).json({ message: "Upload échoué" });
        req.fileUrl = result.secure_url;
        next();
      },
    );
    Readable.from(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error("catch error:", err);
    res.status(500).json({ message: err.message });
  }
};

export default upload;
