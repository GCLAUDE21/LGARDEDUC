import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // 1. Essaie le cookie httpOnly en priorité
  let token = req.cookies?.token;

  // 2. Fallback sur le header Authorization (transition)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.split(" ")[1];
    }
  }

  // 3. Si pas de token du tout, on bloque
  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  // 4. Vérifie le token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

export default authMiddleware;
