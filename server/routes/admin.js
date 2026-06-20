import express from "express";
import ResaModel from "../models/resaModel.js";
import UserModel from "../models/userModel.js";
import authMiddleware from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import DogModel from "../models/dogModel.js";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

router.use(authMiddleware, isAdmin);

// Toutes les réservations
router.get("/reservations", async (req, res) => {
  try {
    const resas = await ResaModel.find({})
      .populate("owner", "pseudo email prenom")
      .populate("dog", "nom photo");
    res.json(resas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tous les utilisateurs
router.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find({}).select("-password");
    const usersAvecDonnees = await Promise.all(
      users.map(async (user) => {
        const chiens = await DogModel.find({ owner: user._id });
        const reservations = await ResaModel.find({ owner: user._id }).populate(
          "dog",
          "nom",
        );
        return { ...user.toObject(), chiens, reservations };
      }),
    );
    res.json(usersAvecDonnees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MAJ UserNotes
router.put("/users/:id/notes", async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true },
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bilan Laura
router.put("/reservations/:id/bilan", async (req, res) => {
  try {
    const resa = await ResaModel.findByIdAndUpdate(
      req.params.id,
      { bilanLaura: req.body.bilanLaura },
      { new: true },
    );
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });
    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ajouter un événement
router.post("/reservations/:id/evenements", async (req, res) => {
  try {
    const resa = await ResaModel.findById(req.params.id);
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });
    resa.evenements.push(req.body);
    await resa.save();
    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Supprimer un événement
router.delete("/reservations/:id/evenements/:evenementId", async (req, res) => {
  try {
    const resa = await ResaModel.findById(req.params.id);
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });
    resa.evenements = resa.evenements.filter(
      (e) => e._id.toString() !== req.params.evenementId,
    );
    await resa.save();
    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Valider une réservation
router.put("/reservations/:id/valider", async (req, res) => {
  try {
    const resa = await ResaModel.findByIdAndUpdate(
      req.params.id,
      { statut: "Validée", contreProposition: null },
      { new: true },
    )
      .populate("owner", "pseudo email prenom")
      .populate("dog", "nom photo");
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });

    await sendMail({
      to: resa.owner.email,
      subject: "✅ Votre réservation est confirmée",
      html: `<p>Bonjour ${resa.owner.prenom || resa.owner.pseudo},</p>
        <p>Nous avons le plaisir de vous informer que votre demande de réservation a été acceptée et confirmée par Laura.</p>
        <p><strong>Type :</strong> ${resa.type}<br>
        <strong>Date :</strong> ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}${resa.dateFin ? ` au ${new Date(resa.dateFin).toLocaleDateString("fr-FR")}` : ""}</p>
        <p>Cordialement,<br>Laura<br>L'Gard'Educ</p>`,
    });

    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Refuser une réservation
router.put("/reservations/:id/refuser", async (req, res) => {
  try {
    const resa = await ResaModel.findByIdAndUpdate(
      req.params.id,
      { statut: "Refusée", motifRefus: req.body.motifRefus },
      { new: true },
    )
      .populate("owner", "pseudo email prenom")
      .populate("dog", "nom photo");
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });

    await sendMail({
      to: resa.owner.email,
      subject: "❌ Votre demande de réservation",
      html: `<p>Bonjour ${resa.owner.prenom || resa.owner.pseudo},</p>
        <p>Malheureusement, Laura n'est pas en mesure d'honorer cette réservation pour la période demandée.</p>
        <p><strong>Type :</strong> ${resa.type}<br>
        <strong>Date :</strong> ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}</p>
        <p><strong>Motif :</strong> ${req.body.motifRefus}</p>
        <p>Cordialement,<br>Laura<br>L'Gard'Educ</p>`,
    });

    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Contre-proposition
router.put("/reservations/:id/contre-proposition", async (req, res) => {
  try {
    const { dateDebut, dateFin, message } = req.body;
    const resa = await ResaModel.findByIdAndUpdate(
      req.params.id,
      {
        statut: "Contre-proposition",
        contreProposition: { dateDebut, dateFin, message },
      },
      { new: true },
    )
      .populate("owner", "pseudo email prenom")
      .populate("dog", "nom photo");
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });

    await sendMail({
      to: resa.owner.email,
      subject: "📅 Laura vous propose de nouvelles dates",
      html: `<p>Bonjour ${resa.owner.prenom || resa.owner.pseudo},</p>
        <p>Laura vous propose une alternative :</p>
        <p><strong>Type :</strong> ${resa.type}<br>
        <strong>Nouvelle date :</strong> ${new Date(dateDebut).toLocaleDateString("fr-FR")}${dateFin ? ` au ${new Date(dateFin).toLocaleDateString("fr-FR")}` : ""}
        ${message ? `<br><strong>Message :</strong> ${message}` : ""}</p>
        <p>Connectez-vous sur lgardeduc.fr pour accepter ou refuser.</p>
        <p>Cordialement,<br>Laura<br>L'Gard'Educ</p>`,
    });

    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Annuler une réservation validée
router.put("/reservations/:id/annuler", async (req, res) => {
  try {
    const resa = await ResaModel.findByIdAndUpdate(
      req.params.id,
      { statut: "Annulée", motifRefus: req.body.motifRefus },
      { new: true },
    )
      .populate("owner", "pseudo email prenom")
      .populate("dog", "nom photo");
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });

    await sendMail({
      to: resa.owner.email,
      subject: "❗ Annulation de votre réservation",
      html: `<p>Bonjour ${resa.owner.prenom || resa.owner.pseudo},</p>
        <p>Laura se voit dans l'obligation d'annuler votre réservation.</p>
        <p><strong>Type :</strong> ${resa.type}<br>
        <strong>Date :</strong> ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}${resa.dateFin ? ` au ${new Date(resa.dateFin).toLocaleDateString("fr-FR")}` : ""}</p>
        <p><strong>Motif :</strong> ${req.body.motifRefus}</p>
        <p>Cordialement,<br>Laura<br>L'Gard'Educ</p>`,
    });

    res.json(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Supprimer définitivement une réservation
router.delete("/reservations/:id", async (req, res) => {
  try {
    const resa = await ResaModel.findByIdAndDelete(req.params.id);
    if (!resa)
      return res.status(404).json({ message: "Réservation introuvable" });
    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
