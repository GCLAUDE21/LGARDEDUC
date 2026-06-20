import express from "express";
import ResaModel from "../models/resaModel.js";
import UserModel from "../models/userModel.js";
import authMiddleware from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import DogModel from "../models/dogModel.js";
import transporter from "../utils/mailer.js";

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

    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: resa.owner.email,
      subject: "✅ Votre réservation est confirmée",
      text: `Bonjour ${resa.owner.prenom || resa.owner.pseudo},\n\nNous avons le plaisir de vous informer que votre demande de réservation a été acceptée et confirmée par Laura.\n\nRécapitulatif de votre réservation :\n- Type : ${resa.type}\n- Date : ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}${resa.dateFin ? ` au ${new Date(resa.dateFin).toLocaleDateString("fr-FR")}` : ""}\n\nSi vous avez des questions ou des informations complémentaires à transmettre, n'hésitez pas à nous contacter via le formulaire de contact sur lgardeduc.fr.\n\nNous nous réjouissons de vous retrouver bientôt !\n\nCordialement,\nLaura\nL'Gard'Educ`,
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

    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: resa.owner.email,
      subject: "❌ Votre demande de réservation",
      text: `Bonjour ${resa.owner.prenom || resa.owner.pseudo},\n\nNous vous remercions de votre confiance et de l'intérêt que vous portez à nos services.\n\nMalheureusement, après examen de votre demande, Laura n'est pas en mesure d'honorer cette réservation pour la période demandée.\n\nRécapitulatif de la demande :\n- Type : ${resa.type}\n- Date : ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}\n\nMotif communiqué par Laura :\n${req.body.motifRefus}\n\nNous vous invitons à soumettre une nouvelle demande pour une autre date via lgardeduc.fr. Laura fera son possible pour trouver un créneau qui vous convienne.\n\nCordialement,\nLaura\nL'Gard'Educ`,
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

    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: resa.owner.email,
      subject: "📅 Laura vous propose de nouvelles dates",
      text: `Bonjour ${resa.owner.prenom || resa.owner.pseudo},\n\nMerci pour votre demande de réservation. Laura a bien pris connaissance de votre demande mais n'est malheureusement pas disponible aux dates souhaitées.\n\nCependant, elle vous propose une alternative :\n\n- Type : ${resa.type}\n- Nouvelle date proposée : ${new Date(dateDebut).toLocaleDateString("fr-FR")}${dateFin ? ` au ${new Date(dateFin).toLocaleDateString("fr-FR")}` : ""}${message ? `\n\nMessage de Laura :\n${message}` : ""}\n\nPour accepter ou refuser cette proposition, connectez-vous sur lgardeduc.fr dans la section "Mes réservations". Cette proposition restera en attente de votre réponse.\n\nCordialement,\nLaura\nL'Gard'Educ`,
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

    await transporter.sendMail({
      from: "L'Gard'Educ <guillaumeclaude@icloud.com>",
      to: resa.owner.email,
      subject: "❗ Annulation de votre réservation",
      text: `Bonjour ${resa.owner.prenom || resa.owner.pseudo},\n\nNous vous contactons au sujet de votre réservation en cours. Laura se voit dans l'obligation d'annuler celle-ci et nous vous en présentons toutes nos excuses.\n\nRécapitulatif de la réservation annulée :\n- Type : ${resa.type}\n- Date : ${new Date(resa.dateDebut).toLocaleDateString("fr-FR")}${resa.dateFin ? ` au ${new Date(resa.dateFin).toLocaleDateString("fr-FR")}` : ""}\n\nMotif communiqué par Laura :\n${req.body.motifRefus}\n\nNous vous invitons à soumettre une nouvelle demande pour une autre date sur lgardeduc.fr. Laura fera son possible pour vous trouver un nouveau créneau dans les meilleurs délais.\n\nEncore toutes nos excuses pour la gêne occasionnée.\n\nCordialement,\nLaura\nL'Gard'Educ`,
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
