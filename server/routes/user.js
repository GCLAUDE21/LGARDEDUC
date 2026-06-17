import express from "express";
import UserModel from "../models/userModel.js";
import authMiddleware from "../middlewares/auth.js";
import DogModel from "../models/dogModel.js";
import ResaModel from "../models/resaModel.js";
import transporter from "../utils/mailer.js";

const router = express.Router();

router.get("/profil", authMiddleware, async (req, res) => {
  try {
    const infosUser = await UserModel.findById(req.user.id).select("-password");

    res.send(infosUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/dogs", authMiddleware, async (req, res) => {
  try {
    const chiensUser = await DogModel.find({ owner: req.user.id });

    res.send(chiensUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/reservations", authMiddleware, async (req, res) => {
  try {
    const resasUser = await ResaModel.find({ owner: req.user.id }).populate(
      "dog",
    );

    res.send(resasUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reservations", authMiddleware, async (req, res) => {
  try {
    const resasUser = new ResaModel({ ...req.body, owner: req.user.id });

    await resasUser.save();

    await transporter.sendMail({
      from: "RESA LGARD'EDUC <guillaumeclaude@icloud.com>",
      to: process.env.LAURA_EMAIL,
      subject: "Nouvelle demande de réservation",
      text: `Une nouvelle réservation a été faite.\n\nType : ${resasUser.type}\nDate début : ${new Date(resasUser.dateDebut).toLocaleDateString("fr-FR")}\nDate fin : ${resasUser.dateFin ? new Date(resasUser.dateFin).toLocaleDateString("fr-FR") : "-"}`,
    });

    res.send(resasUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
