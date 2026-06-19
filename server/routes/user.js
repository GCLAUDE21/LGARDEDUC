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

router.put("/profil", authMiddleware, async (req, res) => {
  try {
    const {
      pseudo,
      email,
      nom,
      prenom,
      dateDeNaissance,
      telephone,
      rue,
      codePostal,
      ville,
    } = req.body;
    const existingPseudo = await UserModel.findOne({
      pseudo,
      _id: { $ne: req.user.id },
    });
    if (existingPseudo) {
      return res.status(400).json({ message: "Ce pseudo est déjà pris." });
    }

    const existingEmail = await UserModel.findOne({
      email,
      _id: { $ne: req.user.id },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        pseudo,
        email,
        nom,
        prenom,
        dateDeNaissance,
        telephone,
        rue,
        codePostal,
        ville,
      },
      { new: true },
    ).select("-password");

    res.send(updatedUser);
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

    const user = await UserModel.findById(req.user.id).select(
      "email prenom pseudo",
    );

    // Email à Laura
    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: process.env.LAURA_EMAIL,
      subject: "Nouvelle demande de réservation",
      text: `Une nouvelle réservation a été faite.\n\nType : ${resasUser.type}\nDate début : ${new Date(resasUser.dateDebut).toLocaleDateString("fr-FR")}\nDate fin : ${resasUser.dateFin ? new Date(resasUser.dateFin).toLocaleDateString("fr-FR") : "-"}`,
    });

    // Email à l'user
    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: user.email,
      subject: "📋 Demande de réservation reçue",
      text: `Bonjour ${user.prenom || user.pseudo},\n\nVotre demande de réservation a bien été reçue.\n\nType : ${resasUser.type}\nDate : ${new Date(resasUser.dateDebut).toLocaleDateString("fr-FR")}${resasUser.dateFin ? `\nDate de fin : ${new Date(resasUser.dateFin).toLocaleDateString("fr-FR")}` : ""}\n\nLaura reviendra vers vous rapidement.\n\nÀ bientôt,\nL'Gard'Educ`,
    });

    res.send(resasUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
