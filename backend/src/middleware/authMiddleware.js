const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const { wrap } = require('../http');
module.exports = wrap(async (req, res, next) => {
  const match = /^Bearer ([^ ]+)$/.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ error: 'Autenticação necessária.' });
  let decoded;
  try { decoded = jwt.verify(match[1], secret, { algorithms: ['HS256'] }); }
  catch { return res.status(401).json({ error: 'Sessão inválida ou expirada.' }); }
  const user = await req.app.locals.models.User.findByPk(decoded.id);
  if (!user || !user.ativo) return res.status(401).json({ error: 'Sessão inválida ou usuário inativo.' });
  req.user = user;
  next();
});
