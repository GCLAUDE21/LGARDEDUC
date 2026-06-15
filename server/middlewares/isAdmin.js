const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};

export default isAdmin;
