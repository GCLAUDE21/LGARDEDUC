import UserModel from "../models/userModel.js";
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../utils/mailer.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// --- Inscription ---
router.post("/signup", async (req, res) => {
  try {
    const emailToken = crypto.randomBytes(32).toString("hex");
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new UserModel({
      ...req.body,
      emailToken,
      emailTokenExpires,
      isVerified: false,
    });

    await user.save();

    const confirmUrl = `${process.env.FRONTEND_URL}/confirmer-email?token=${emailToken}`;

    try {
      const info = await transporter.sendMail({
        from: `"L Gard'Educ" <${process.env.LAURA_EMAIL}>`,
        to: user.email,
        subject: "Confirmez votre inscription",
        html: `
          <p>Bonjour ${user.prenom || user.pseudo},</p>
          <p>Merci de vous être inscrit sur L Gard'Educ.</p>
          <p>Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p>
          <a href="${confirmUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background: #c9922a;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 16px 0;
          ">Confirmer mon email</a>
          <p>Ce lien expire dans 24h.</p>
          <p>Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.</p>
        `,
      });
      console.log("Mail envoyé :", info.messageId);
    } catch (mailErr) {
      console.error("Erreur envoi mail :", mailErr);
    }

    res.json({
      message:
        "Inscription réussie ! Vérifiez votre email pour activer votre compte.",
    });
  } catch (err) {
    console.log("ERREUR signup:", err);
    res.status(400).json({ message: err.message });
  }
});

// --- Vérification email ---
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await UserModel.findOne({
      emailToken: token,
      emailTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Lien invalide ou expiré." });
    }

    user.isVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email confirmé ! Vous pouvez vous connecter." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Connexion ---
router.post("/signin", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Veuillez confirmer votre email avant de vous connecter.",
      });
    }

    const isValid = await user.isValidPassword(req.body.password);
    if (!isValid) {
      return res.status(401).json({ message: "Erreur de connexion" });
    }

    const token = jwt.sign(
      { id: user._id, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: "48h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 48 * 60 * 60 * 1000, // 48h
    });

    res.json({ message: "Connexion réussie" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Déconnexion ---
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.json({ message: "Déconnecté" });
});

// --- Vérifier si connecté ---
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/fix-users", async (req, res) => {
  await UserModel.updateMany(
    { isVerified: { $exists: false } },
    { isVerified: true },
  );
  res.json({ message: "Users patchés" });
});

export default router;
