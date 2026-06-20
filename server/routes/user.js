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

// Récupérer un chien par son ID
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

    // Email à Laura
    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: process.env.LAURA_EMAIL,
      subject: "🐾 Nouvelle demande de réservation",
      text: `Bonjour Laura,\n\nUne nouvelle demande de réservation vient d'être soumise sur lgardeduc.fr.\n\nDétails :\n- Client : ${user.prenom || user.pseudo} (${user.email})\n- Type : ${resasUser.type}\n- Date : ${new Date(resasUser.dateDebut).toLocaleDateString("fr-FR")}${resasUser.dateFin ? ` au ${new Date(resasUser.dateFin).toLocaleDateString("fr-FR")}` : ""}${resasUser.notes ? `\n- Notes du client : ${resasUser.notes}` : ""}\n\nConnectez-vous sur lgardeduc.fr pour valider, refuser ou faire une contre-proposition.\n\nCordialement,\nL'Gard'Educ`,
    });

    // Email à l'user
    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: user.email,
      subject: "📋 Demande de réservation reçue",
      text: `Bonjour ${user.prenom || user.pseudo},\n\nNous avons bien reçu votre demande de réservation. Laura l'examinera dans les meilleurs délais et vous en informera par email.\n\nRécapitulatif de votre demande :\n- Type : ${resasUser.type}\n- Date : ${new Date(resasUser.dateDebut).toLocaleDateString("fr-FR")}${resasUser.dateFin ? ` au ${new Date(resasUser.dateFin).toLocaleDateString("fr-FR")}` : ""}${resasUser.notes ? `\n- Vos notes : ${resasUser.notes}` : ""}\n\nSi vous avez des questions, n'hésitez pas à nous contacter via le formulaire de contact sur lgardeduc.fr.\n\nCordialement,\nLaura\nL'Gard'Educ`,
    });

    res.send(resasUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// Accepter la contre-proposition de Laura
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

      // Email à Laura pour la prévenir de l'acceptation
      await transporter.sendMail({
        from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
        to: process.env.LAURA_EMAIL,
        subject: "✅ Contre-proposition acceptée",
        text: `Bonjour Laura,\n\n${resa.owner.prenom || resa.owner.pseudo} a accepté votre contre-proposition.\n\n- Type : ${resa.type}\n- Nouvelle date : ${new Date(resa.contreProposition.dateDebut).toLocaleDateString("fr-FR")}${resa.contreProposition.dateFin ? ` au ${new Date(resa.contreProposition.dateFin).toLocaleDateString("fr-FR")}` : ""}\n\nLa réservation est maintenant confirmée.\n\nCordialement,\nL'Gard'Educ`,
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// Refuser la contre-proposition de Laura
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

      // Email à Laura pour la prévenir du refus
      await transporter.sendMail({
        from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
        to: process.env.LAURA_EMAIL,
        subject: "❌ Contre-proposition refusée",
        text: `Bonjour Laura,\n\n${resa.owner.prenom || resa.owner.pseudo} a refusé votre contre-proposition pour la réservation suivante :\n\n- Type : ${resa.type}\n- Date initiale : ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}\n\nLa réservation est passée au statut "Refusée". Vous pouvez contacter ce client directement à l'adresse : ${resa.owner.email}\n\nCordialement,\nL'Gard'Educ`,
      });

      res.json(resa);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// Mettre à jour les notes d'une réservation
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
