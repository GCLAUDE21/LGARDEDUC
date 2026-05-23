import express from "express";
import ResaModel from "../models/resaModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const resa = new ResaModel(req.body);

    await resa.save();

    res.send(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const resas = await ResaModel.find({});

    if (resas.length === 0) {
      res.send("Pas de reservations");
    } else res.send(resas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const resa = await ResaModel.findById(req.params.id);

    if (!resa) {
      res.status(404).json();
    } else res.send(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const resa = await ResaModel.findByIdAndDelete(req.params.id);
    if (!resa) {
      res.status(404).json();
    } else res.send("Reservation Supprimé !");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const resa = await ResaModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!resa) {
      res.status(404).json();
    } else res.send(resa);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
