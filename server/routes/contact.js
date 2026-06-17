import express from "express";
import MessageModel from "../models/messageModel.js";
import transporter from "../utils/mailer.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { nom, mail, tel, objet, message } = req.body;
  try {
    const newMessage = new MessageModel(req.body);
    await newMessage.save();

    await transporter.sendMail({
      from: "CONTACT LGARD'EDUC <guillaumeclaude@icloud.com>",
      to: process.env.LAURA_EMAIL,
      subject: `${nom} - ${objet}`,
      text: `De la part de : ${nom}\nTél : ${tel}\nMail : ${mail}\n\nObjet : ${objet}\n\n${message}`,
    });

    res.send(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
