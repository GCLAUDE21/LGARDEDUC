import express from "express";
import upload from "../middlewares/upload.js";
import { uploadToCloudinary } from "../middlewares/upload.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    console.log("file reçu:", req.file);
    console.log("folder:", req.query.folder);
    req.query.folder = req.query.folder || "misc";
    return uploadToCloudinary(req.query.folder)(req, res, () => {
      if (!req.fileUrl)
        return res.status(400).json({ message: "Aucun fichier reçu" });
      res.json({ url: req.fileUrl });
    });
  },
);

export default router;
