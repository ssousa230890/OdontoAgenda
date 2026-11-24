require('dotenv').config();
require('../config');
const sequelize = require('../database');
const models = require('../models/initModels')(sequelize);
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Creates missing tables only; never force/alter existing tables.
    await require('../seed')(models);
    console.log('Banco inicializado.');
  } catch (err) { console.error(err.message); process.exitCode = 1; }
  finally { await sequelize.close(); }
})();
