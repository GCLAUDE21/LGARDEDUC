import express from "express";
import UserModel from "../models/userModel.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.get("/profil", authMiddleware, async (req, res) => {
  try {
    const infosUser = await UserModel.findById(req.user.id).select("-password");

    res.send(infosUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
