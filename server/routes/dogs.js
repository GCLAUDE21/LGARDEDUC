import express from "express";
import DogModel from "../models/dogModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const dog = new DogModel(req.body);

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

router.delete("/:id", async (req, res) => {
  try {
    const dog = await DogModel.findByIdAndDelete(req.params.id);
    if (!dog) {
      res.status(404).json();
    } else res.send("Chien Supprimé !");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const dog = await DogModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!dog) {
      res.status(404).json();
    } else res.send(dog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
