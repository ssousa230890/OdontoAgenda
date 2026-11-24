const { fail } = require('./http');
function validate(data) {
  if (!Number.isInteger(Number(data.patientId)) || Number(data.patientId) < 1 || !Number.isInteger(Number(data.dentistId)) || Number(data.dentistId) < 1) fail(400, 'Selecione paciente e dentista.');
  if (typeof data.date !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(data.date) || !Number.isFinite(Date.parse(data.date))) fail(400, 'Informe uma data com fuso horário.');
  const duration = Number(data.duration_minutes);
  if (!Number.isInteger(duration) || duration < 5 || duration > 240) fail(400, 'A duração deve estar entre 5 e 240 minutos.');
  if (!['agendado','concluido','cancelado'].includes(data.status)) fail(400, 'Status inválido.');
  if (data.notes !== undefined && (typeof data.notes !== 'string' || data.notes.length > 2000)) fail(400, 'As observações devem ter até 2000 caracteres.');
  return { ...data, patientId: Number(data.patientId), dentistId: Number(data.dentistId), duration_minutes: duration };
}
function overlaps(a, b) {
  return new Date(a.date).getTime() < new Date(b.date).getTime() + b.duration_minutes * 60000 && new Date(b.date).getTime() < new Date(a.date).getTime() + a.duration_minutes * 60000;
}
module.exports = { validate, overlaps };
