const express = require('express');
const { wrap, pick, cpf, required, fail } = require('../http');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const fields = ['nomeCompleto', 'nomeGuerra', 'postoGraduacao', 'identidadeMilitar', 'cpf', 'om', 'email', 'perfil', 'ativo'];
module.exports = ({ User }) => {
  const router = express.Router();
  router.use(auth, role('admin'));
  router.get('/', wrap(async (req, res) => res.json(await User.findAll({ attributes: { exclude: ['senha'] }, order: [['nomeCompleto', 'ASC']] }))));
  router.post('/register', wrap(async (req, res) => {
    const data = pick(req.body, [...fields, 'senha']);
    required(data, ['nomeCompleto', 'nomeGuerra', 'postoGraduacao', 'identidadeMilitar', 'om', 'senha']);
    data.cpf = cpf(data.cpf);
    if (data.senha.length < 12 || Buffer.byteLength(data.senha) > 72) fail(400, 'A senha deve ter pelo menos 12 caracteres e no máximo 72 bytes.');
    if (data.ativo !== undefined && typeof data.ativo !== 'boolean') fail(400, 'O campo ativo deve ser verdadeiro ou falso.');
    if (data.email === '') data.email = null;
    const user = await User.create(data);
    const result = user.toJSON(); delete result.senha;
    res.status(201).json(result);
  }));
  router.put('/:id', wrap(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) fail(404, 'Usuário não encontrado.');
    const data = pick(req.body, fields);
    if (user.id === req.user.id && (data.ativo === false || (data.perfil && data.perfil !== 'admin'))) fail(400, 'Você não pode remover o próprio acesso administrativo.');
    if (data.cpf !== undefined) data.cpf = cpf(data.cpf);
    if (data.email === '') data.email = null;
    await user.update(data);
    const result = user.toJSON(); delete result.senha;
    res.json(result);
  }));
  return router;
};
