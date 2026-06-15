import express from "express";
import ResaModel from "../models/resaModel.js";
import UserModel from "../models/userModel.js";
import authMiddleware from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import DogModel from "../models/dogModel.js";

const router = express.Router();

router.use(authMiddleware, isAdmin);

// Toutes les réservations
router.get("/reservations", async (req, res) => {
  try {
    const resas = await ResaModel.find({})
      .populate("owner", "pseudo email")
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
        return {
          ...user.toObject(),
          chiens,
          reservations,
        };
      }),
    );

    res.json(usersAvecDonnees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
