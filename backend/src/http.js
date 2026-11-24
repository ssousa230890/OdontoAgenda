const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
const pick = (body, fields) => Object.fromEntries(fields.filter(k => Object.hasOwn(body, k)).map(k => [k, typeof body[k] === 'string' && k !== 'senha' ? body[k].trim() : body[k]]));
function cpf(value) {
  if (typeof value !== 'string') fail(400, 'CPF inválido.');
  const digits = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) fail(400, 'CPF inválido.');
  for (let n = 9; n < 11; n++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Number(digits[i]) * (n + 1 - i);
    const check = (sum * 10) % 11 % 10;
    if (check !== Number(digits[n])) fail(400, 'CPF inválido.');
  }
  return digits;
}
const required = (data, fields) => fields.forEach(k => { if (typeof data[k] !== 'string' || !data[k].trim()) fail(400, 'Preencha o campo ' + k + '.'); });
module.exports = { wrap, fail, pick, cpf, required };
