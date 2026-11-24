require('dotenv').config();
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32 || /change_me|supersecret|odonto_secret/i.test(secret)) {
  throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres aleatórios no .env.');
}
module.exports = { secret, origin: process.env.CORS_ORIGIN || 'http://localhost:3000' };
