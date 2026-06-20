import express from "express";
import MessageModel from "../models/messageModel.js";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { nom, mail, tel, objet, message } = req.body;
  try {
    const newMessage = new MessageModel(req.body);
    await newMessage.save();

    await sendMail({
      to: process.env.LAURA_EMAIL,
      subject: `${nom} - ${objet}`,
      html: `<p><strong>De :</strong> ${nom}<br>
        <strong>Tél :</strong> ${tel}<br>
        <strong>Mail :</strong> ${mail}</p>
        <p><strong>Objet :</strong> ${objet}</p>
        <p>${message}</p>`,
    });

    res.send(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
