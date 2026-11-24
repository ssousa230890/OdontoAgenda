module.exports = sequelize => {
  if (sequelize.models.User) return sequelize.models;
  const User = require('./User')(sequelize);
  const Patient = require('./Patient')(sequelize);
  const Dentist = require('./Dentist')(sequelize);
  const Appointment = require('./Appointment')(sequelize);
  Patient.hasMany(Appointment, { foreignKey: { name: 'PatientId', allowNull: false }, onDelete: 'RESTRICT' });
  Appointment.belongsTo(Patient, { foreignKey: { name: 'PatientId', allowNull: false } });
  Dentist.hasMany(Appointment, { foreignKey: { name: 'DentistId', allowNull: false }, onDelete: 'RESTRICT' });
  Appointment.belongsTo(Dentist, { foreignKey: { name: 'DentistId', allowNull: false } });
  User.hasMany(Appointment, { foreignKey: { name: 'createdById', allowNull: false }, onDelete: 'RESTRICT' });
  Appointment.belongsTo(User, { as: 'createdBy', foreignKey: { name: 'createdById', allowNull: false } });
  return { User, Patient, Dentist, Appointment };
};
