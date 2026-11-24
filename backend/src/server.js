require('dotenv').config();
const sequelize = require('./database');
const models = require('./models/initModels')(sequelize);
const app = require('./app')(models, sequelize);
let server;
async function start() {
  await sequelize.authenticate();
  server = app.listen(Number(process.env.PORT || 5000), () => console.log('OdontoAgenda: API disponível.'));
}
async function stop() {
  if (server) await new Promise(resolve => server.close(resolve));
  await sequelize.close();
}
process.on('SIGTERM', () => stop().then(() => process.exit(0)));
process.on('SIGINT', () => stop().then(() => process.exit(0)));
if (require.main === module) start().catch(err => { console.error('Falha ao iniciar: ' + err.message); process.exit(1); });
module.exports = { app, start, stop };
