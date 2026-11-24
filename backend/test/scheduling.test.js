const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validate, overlaps } = require('../src/scheduling');
const { cpf } = require('../src/http');
const base = { patientId: 1, dentistId: 2, date: '2026-12-01T10:00:00-03:00', duration_minutes: 30, status: 'agendado', notes: '' };
test('CPF normaliza e valida dígitos verificadores', () => {
  assert.equal(cpf('529.982.247-25'), '52998224725');
  for(const value of ['00000000000','52998224724','123',null,{}]) assert.throws(()=>cpf(value));
});
test('agenda rejeita datas sem fuso, duração e referências inválidas', () => {
  assert.equal(validate(base).duration_minutes,30);
  for(const patch of [{date:'inválido'},{date:'2026-12-01T10:00'},{duration_minutes:0},{duration_minutes:241},{duration_minutes:5.5},{patientId:0},{dentistId:'x'},{status:'ausente'},{notes:{}}]) assert.throws(()=>validate({...base,...patch}));
});
test('intervalos adjacentes são permitidos; sobreposição é simétrica', () => {
  const adjacent={...base,date:'2026-12-01T10:30:00-03:00'};
  const conflict={...base,date:'2026-12-01T13:15:00Z'};
  assert.equal(overlaps(base,adjacent),false);
  assert.equal(overlaps(base,conflict),true);
  assert.equal(overlaps(conflict,base),true);
});
