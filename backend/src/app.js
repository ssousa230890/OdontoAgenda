const express = require('express');
const cors = require('cors');
const { origin } = require('./config');
module.exports = (models, sequelize) => {
  const app = express();
  app.disable('x-powered-by');
  app.locals.models = models;
  app.use(cors({ origin: origin.split(',').map(s => s.trim()) }));
  app.use(express.json({ limit: '64kb' }));
  app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); res.set('X-Content-Type-Options', 'nosniff'); next(); });
  app.get('/health', require('./http').wrap(async (req, res) => { await sequelize.authenticate(); res.json({ status: 'ok' }); }));
  app.use('/auth', require('./routes/auth')(models));
  app.use('/users', require('./routes/userRoutes')(models));
  app.use('/patients', require('./routes/records')(models, 'patients'));
  app.use('/dentists', require('./routes/records')(models, 'dentists'));
  app.use('/appointments', require('./routes/appointments')(models, sequelize));
  app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
  app.use((err, req, res, next) => {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ error: 'CPF ou CRO j? cadastrado.' });
    if (err.name === 'SequelizeForeignKeyConstraintError') return res.status(409).json({ error: 'Registro vinculado a agendamentos. Cancele o atendimento ou preserve o cadastro.' });
    if (err.name === 'SequelizeValidationError') return res.status(400).json({ error: 'Dados inválidos. Verifique os campos obrigatórios e os formatos.' });
    const status = err.status || 500;
    if (status === 500) console.error(err.name + ': ' + err.message);
    res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
  });
  return app;
};
