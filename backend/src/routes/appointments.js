const express = require('express');
const { Op } = require('sequelize');
const { wrap, pick, fail } = require('../http');
const { validate, overlaps } = require('../scheduling');
module.exports = ({ Appointment, Patient, Dentist }, sequelize) => {
  const router = express.Router();
  router.use(require('../middleware/authMiddleware'));
  router.get('/', wrap(async (req, res) => res.json(await Appointment.findAll({ include: [Patient, Dentist], order: [['date','ASC']] }))));
  const save = wrap(async (req, res) => {
    const result = await sequelize.transaction(async transaction => {
      // Serialize scheduling mutations, including concurrent changes to different dentists.
      await sequelize.models.User.findAll({ attributes: ['id'], order: [['id','ASC']], transaction, lock: transaction.LOCK.UPDATE });
      let current;
      if (req.params.id) { current = await Appointment.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE }); if (!current) fail(404, 'Agendamento não encontrado.'); }
      const body = pick(req.body, ['patientId','dentistId','date','duration_minutes','notes','status']);
      const existing = current ? { ...current.toJSON(), patientId: current.PatientId, dentistId: current.DentistId, date: current.date.toISOString() } : { duration_minutes: 30, status: 'agendado', notes: '' };
      const data = validate({ ...existing, ...body });
      if (req.user.perfil === 'dentista' && (!current || Object.keys(body).some(key => !['status','notes'].includes(key)))) fail(403, 'Dentistas podem atualizar somente status e observações.');
      const dentist = await Dentist.findByPk(data.dentistId, { transaction });
      const patient = await Patient.findByPk(data.patientId, { transaction });
      if (!dentist || !patient) fail(400, 'Paciente ou dentista não encontrado.');
      if (data.status !== 'cancelado') {
        const appointments = await Appointment.findAll({ where: { status: { [Op.ne]: 'cancelado' }, [Op.or]: [{ DentistId: data.dentistId }, { PatientId: data.patientId }] }, transaction });
        if (appointments.some(a => (!current || a.id !== current.id) && overlaps(data, a))) fail(409, 'Conflito de horário para o paciente ou dentista.');
      }
      const payload = { PatientId: data.patientId, DentistId: data.dentistId, date: data.date, duration_minutes: data.duration_minutes, notes: data.notes, status: data.status };
      return current ? current.update(payload, { transaction }) : Appointment.create({ ...payload, createdById: req.user.id }, { transaction });
    });
    res.status(req.params.id ? 200 : 201).json(result);
  });
  router.post('/', save);
  router.put('/:id', save);
  router.delete('/:id', require('../middleware/roleMiddleware')('admin'), wrap(async (req, res) => {
    const item = await Appointment.findByPk(req.params.id); if (!item) fail(404, 'Agendamento não encontrado.');
    await item.destroy(); res.status(204).end();
  }));
  return router;
};
