module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.perfil)) return res.status(403).json({ error: 'Seu perfil não permite esta operação.' });
  next();
};
