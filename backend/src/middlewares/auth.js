export function isAdmin(req, res, next) {
  const user = req.user;

  if (!user || user.admin !== 1) {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  next();
}