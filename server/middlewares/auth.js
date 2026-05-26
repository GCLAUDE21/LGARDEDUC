import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // 1. Récupère le header Authorization
  const authHeader = req.headers.authorization;

  // 2. Si pas de header, on bloque
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  // 3. Extrait le token en retirant "Bearer "
  const token = authHeader.split(" ")[1];

  // 4. Vérifie le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // on attache l'user à la requête
    next(); // on laisse passer
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

export default authMiddleware;
