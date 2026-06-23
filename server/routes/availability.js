import express from "express";
import AvailabilityModel from "../models/availabilityModel.js";
import SettingsModel from "../models/settingsModel.js";
import ResaModel from "../models/resaModel.js";
import authMiddleware from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// --- GET public : dispo calculées par type et date ---
// Retourne les blocages manuels + occupation calculée depuis les resas validées
router.get("/", async (req, res) => {
  try {
    const [blocages, settings] = await Promise.all([
      AvailabilityModel.find().sort({ dateDebut: 1 }),
      SettingsModel.findOne(),
    ]);

    const capaciteMaxPension = settings?.capaciteMaxPension || 4;

    // Resas validées uniquement
    const resasValidees = await ResaModel.find({ statut: "Validée" })
      .populate("owner", "pseudo email prenom")
      .populate("dog", "nom photo");

    res.json({
      blocages,
      capaciteMaxPension,
      resasValidees: resasValidees.map((r) => ({
        _id: r._id,
        type: r.type,
        dateDebut: r.dateDebut,
        dateFin: r.dateFin,
        slot: r.slot,
        passagesParJour: r.passagesParJour,
        heuresPassages: r.heuresPassages,
        owner: r.owner,
        dog: r.dog,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- POST admin : ajouter un blocage manuel ---
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { dateDebut, dateFin, type, slot, motif } = req.body;
    const plage = new AvailabilityModel({
      dateDebut,
      dateFin,
      type,
      slot,
      motif,
    });
    await plage.save();
    res.status(201).json(plage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- DELETE admin : supprimer un blocage manuel ---
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await AvailabilityModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Blocage supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET admin : récupérer les settings ---
router.get("/settings", authMiddleware, isAdmin, async (req, res) => {
  try {
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create({ capaciteMaxPension: 4 });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PUT admin : modifier la capacité max pension ---
router.put("/settings", authMiddleware, isAdmin, async (req, res) => {
  try {
    let settings = await SettingsModel.findOne();
    if (!settings) {
      settings = await SettingsModel.create({
        capaciteMaxPension: req.body.capaciteMaxPension,
      });
    } else {
      settings.capaciteMaxPension = req.body.capaciteMaxPension;
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
