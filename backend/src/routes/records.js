const express = require('express');
const { wrap, pick, cpf, required, fail } = require('../http');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
module.exports = (models, kind) => {
  const router = express.Router();
  const patient = kind === 'patients';
  const Model = patient ? models.Patient : models.Dentist;
  const fields = patient ? ['nomeCompleto','nomeGuerra','cpf','postoGraduacao','om','email','telefone','address','identidadeMilitar','dataNascimento'] : ['nome','cro','especialidade'];
  const requiredFields = patient ? ['nomeCompleto','cpf','postoGraduacao','om'] : ['nome','cro'];
  const normalize = data => {
    if (patient && data.cpf !== undefined) data.cpf = cpf(data.cpf);
    for (const key of ['email','dataNascimento']) if (data[key] === '') data[key] = null;
    if (data.dataNascimento && (typeof data.dataNascimento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.dataNascimento) || !Number.isFinite(Date.parse(data.dataNascimento)) || data.dataNascimento > new Date().toISOString().slice(0, 10))) fail(400, 'Data de nascimento inválida.');
    for (const [key, value] of Object.entries(data)) if (value !== null && typeof value !== 'string') fail(400, 'Campo inválido: ' + key);
    return data;
  };
  const writeRoles = patient ? role('admin','recepcionista') : role('admin');
  router.use(auth);
  router.get('/', wrap(async (req, res) => res.json(await Model.findAll({ order: [[patient ? 'nomeCompleto' : 'nome', 'ASC']] }))));
  router.get('/:id', wrap(async (req, res) => { const item = await Model.findByPk(req.params.id); if (!item) fail(404, 'Registro não encontrado.'); res.json(item); }));
  router.post('/', writeRoles, wrap(async (req, res) => {
    const data = normalize(pick(req.body, fields)); required(data, requiredFields);
    res.status(201).json(await Model.create(data));
  }));
  router.put('/:id', writeRoles, wrap(async (req, res) => {
    const item = await Model.findByPk(req.params.id); if (!item) fail(404, 'Registro não encontrado.');
    const data = normalize(pick(req.body, fields)); required({ ...item.toJSON(), ...data }, requiredFields);
    res.json(await item.update(data));
  }));
  router.delete('/:id', role('admin'), wrap(async (req, res) => {
    const item = await Model.findByPk(req.params.id); if (!item) fail(404, 'Registro não encontrado.');
    await item.destroy(); res.status(204).end();
  }));
  return router;
};
