require('dotenv').config();
const { Sequelize } = require('sequelize');
if (!process.env.DB_PASS) throw new Error('Configure DB_PASS no .env.');
module.exports = new Sequelize(process.env.DB_NAME || 'odontoagenda', process.env.DB_USER || 'odonto', process.env.DB_PASS, {
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql', logging: false, timezone: '-03:00',
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});
