import UserModel from "../models/userModel.js";
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const user = new UserModel(req.body);

    await user.save();
    res.send("Inscription réussi !");
  } catch (err) {
    console.log("ERREUR:", err);
    res.status(400).json({ message: err.message });
  }
});

router.post("/signin", async (req, res) => {
  console.log(req.body);

  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const isValid = await user.isValidPassword(req.body.password);
    if (isValid) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "48h",
      });

      res.json({ token });
    } else {
      return res.status(404).json({ message: "Erreur de connexion" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
