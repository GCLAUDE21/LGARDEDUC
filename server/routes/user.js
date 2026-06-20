import express from "express";
import UserModel from "../models/userModel.js";
import authMiddleware from "../middlewares/auth.js";
import DogModel from "../models/dogModel.js";
import ResaModel from "../models/resaModel.js";
import { sendMail } from "../utils/mailer.js";

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
    if (existingPseudo)
      return res.status(400).json({ message: "Ce pseudo est déjà pris." });

    const existingEmail = await UserModel.findOne({
      email,
      _id: { $ne: req.user.id },
    });
    if (existingEmail)
      return res.status(400).json({ message: "Cet email est déjà utilisé." });

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

router.get("/dogs/:id", authMiddleware, async (req, res) => {
  try {
    const chien = await DogModel.findById(req.params.id);
    if (!chien) return res.status(404).json({ message: "Chien introuvable" });
    res.json(chien);
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

    await sendMail({
      to: process.env.LAURA_EMAIL,
      subject: "🐾 Nouvelle demande de réservation",
      html: `<p>Bonjour Laura,</p>
        <p>Une nouvelle demande de réservation vient d'être soumise.</p>
        <p><strong>Client :</strong> ${user.prenom || user.pseudo} (${user.email})<br>
        <strong>Type :</strong> ${resasUser.type}<br>
        <strong>Date :</strong> ${new Date(resasUser.dateDebut).toLocaleDateString("fr-FR")}${resasUser.dateFin ? ` au ${new Date(resasUser.dateFin).toLocaleDateString("fr-FR")}` : ""}
        ${resasUser.notes ? `<br><strong>Notes :</strong> ${resasUser.notes}` : ""}</p>
        <p>Connectez-vous sur lgardeduc.fr pour valider, refuser ou faire une contre-proposition.</p>`,
    });

    await sendMail({
      to: user.email,
      subject: "📋 Demande de réservation reçue",
      html: `<p>Bonjour ${user.prenom || user.pseudo},</p>
        <p>Nous avons bien reçu votre demande de réservation. Laura l'examinera dans les meilleurs délais.</p>
        <p><strong>Type :</strong> ${resasUser.type}<br>
        <strong>Date :</strong> ${new Date(resasUser.dateDebut).toLocaleDateString("fr-FR")}${resasUser.dateFin ? ` au ${new Date(resasUser.dateFin).toLocaleDateString("fr-FR")}` : ""}
        ${resasUser.notes ? `<br><strong>Vos notes :</strong> ${resasUser.notes}` : ""}</p>
        <p>Cordialement,<br>Laura<br>L'Gard'Educ</p>`,
    });

    res.send(resasUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.put(
  "/reservations/:id/contre-proposition/accepter",
  authMiddleware,
  async (req, res) => {
    try {
      const resa = await ResaModel.findById(req.params.id).populate(
        "owner",
        "pseudo email prenom",
      );
      if (!resa)
        return res.status(404).json({ message: "Réservation introuvable" });

      const updated = await ResaModel.findByIdAndUpdate(
        req.params.id,
        {
          statut: "Validée",
          dateDebut: resa.contreProposition.dateDebut,
          dateFin: resa.contreProposition.dateFin || null,
          $unset: { contreProposition: "" },
        },
        { new: true },
      );

      await sendMail({
        to: process.env.LAURA_EMAIL,
        subject: "✅ Contre-proposition acceptée",
        html: `<p>Bonjour Laura,</p>
        <p>${resa.owner.prenom || resa.owner.pseudo} a accepté votre contre-proposition.</p>
        <p><strong>Type :</strong> ${resa.type}<br>
        <strong>Nouvelle date :</strong> ${new Date(resa.contreProposition.dateDebut).toLocaleDateString("fr-FR")}${resa.contreProposition.dateFin ? ` au ${new Date(resa.contreProposition.dateFin).toLocaleDateString("fr-FR")}` : ""}</p>
        <p>La réservation est maintenant confirmée.</p>`,
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

router.put(
  "/reservations/:id/contre-proposition/refuser",
  authMiddleware,
  async (req, res) => {
    try {
      const resa = await ResaModel.findById(req.params.id).populate(
        "owner",
        "pseudo email prenom",
      );
      if (!resa)
        return res.status(404).json({ message: "Réservation introuvable" });

      resa.statut = "Refusée";
      resa.contreProposition = null;
      await resa.save();

      await sendMail({
        to: process.env.LAURA_EMAIL,
        subject: "❌ Contre-proposition refusée",
        html: `<p>Bonjour Laura,</p>
        <p>${resa.owner.prenom || resa.owner.pseudo} a refusé votre contre-proposition.</p>
        <p><strong>Type :</strong> ${resa.type}<br>
        <strong>Date initiale :</strong> ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}</p>
        <p>Vous pouvez contacter ce client à : ${resa.owner.email}</p>`,
      });

      res.json(resa);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

router.put("/reservations/:id", authMiddleware, async (req, res) => {
  try {
    const resa = await ResaModel.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true },
    ).populate("dog");
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });
    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
