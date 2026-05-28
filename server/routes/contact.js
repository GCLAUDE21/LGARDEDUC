import express from "express";
import MessageModel from "../models/messageModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const message = new MessageModel(req.body);
    await message.save();

    res.send(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
