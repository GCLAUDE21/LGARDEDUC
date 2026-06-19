import express from "express";
import DogModel from "../models/dogModel.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const dog = new DogModel({ ...req.body, owner: req.user.id });

    await dog.save();

    res.send(dog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const dogs = await DogModel.find({});

    if (dogs.length === 0) {
      res.send("Pas de chiens");
    } else res.send(dogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const dog = await DogModel.findById(req.params.id);

    if (!dog) {
      res.status(404).json();
    } else res.send(dog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const dog = await DogModel.findById(req.params.id);
    if (!dog) return res.status(404).json({ message: "Chien introuvable" });
    if (dog.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Non autorisé" });

    await DogModel.findByIdAndDelete(req.params.id);
    res.send("Chien Supprimé !");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const dog = await DogModel.findById(req.params.id);
    if (!dog) return res.status(404).json({ message: "Chien introuvable" });
    if (dog.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Non autorisé" });

    const updated = await DogModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
