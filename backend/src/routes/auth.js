const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { secret } = require('../config');
const { wrap, cpf, fail } = require('../http');
const publicUser = u => { const data = u.toJSON(); delete data.senha; return data; };
module.exports = ({ User }) => {
  const router = express.Router();
  const attempts = new Map();
  const cleanup = setInterval(() => { const now = Date.now(); for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key); }, 60000);
  cleanup.unref();
  const dummyHash = bcrypt.hashSync('invalid-account-placeholder', 10);
  router.post('/login', wrap(async (req, res) => {
    const value = cpf(req.body.cpf);
    const key = req.ip + ':' + value;
    const now = Date.now();
    let entry = attempts.get(key);
    if (!entry || entry.until <= now) { entry = { count: 0, until: now + 15 * 60000 }; if (attempts.size >= 10000) attempts.delete(attempts.keys().next().value); attempts.set(key, entry); }
    if (++entry.count > 30) { res.set('Retry-After', String(Math.ceil((entry.until - now) / 1000))); return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }); }
    if (typeof req.body.senha !== 'string' || !req.body.senha || Buffer.byteLength(req.body.senha) > 72) fail(400, 'Informe uma senha válida.');
    const user = await User.findOne({ where: { cpf: value } });
    const valid = await bcrypt.compare(req.body.senha, user ? user.senha : dummyHash);
    if (!user || !user.ativo || !valid) fail(401, 'CPF ou senha inválidos.');
    attempts.delete(key);
    const token = jwt.sign({ id: user.id, perfil: user.perfil, nomeGuerra: user.nomeGuerra, postoGraduacao: user.postoGraduacao }, secret, { expiresIn: '8h', algorithm: 'HS256' });
    res.json({ token, usuario: publicUser(user) });
  }));
  router.get('/me', require('../middleware/authMiddleware'), (req, res) => res.json(publicUser(req.user)));
  router.put('/password', require('../middleware/authMiddleware'), wrap(async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;
    if (typeof senhaAtual !== 'string' || !await req.user.validarSenha(senhaAtual)) fail(400, 'Senha atual incorreta.');
    if (typeof novaSenha !== 'string' || novaSenha.length < 12 || Buffer.byteLength(novaSenha) > 72) fail(400, 'A nova senha deve ter pelo menos 12 caracteres e no máximo 72 bytes.');
    await req.user.update({ senha: novaSenha });
    res.json({ message: 'Senha alterada.' });
  }));
  return router;
};
