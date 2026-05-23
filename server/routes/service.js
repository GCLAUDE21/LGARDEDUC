import express from "express";
import ServiceModel from "../models/serviceModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const services = await ServiceModel.find({});

    res.send(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await ServiceModel.findById(req.params.id);

    if (!service) {
      return res.status(404).json();
    } else res.send(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const service = new ServiceModel(req.body);

    await service.save();
    res.send(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const service = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!service) {
      return res.status(404).json();
    } else res.send(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const service = await ServiceModel.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json();
    } else res.send("Service Supprimé !");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
