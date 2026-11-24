const { DataTypes } = require('sequelize');
module.exports = sequelize => sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATE, field: 'data', allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30, validate: { min: 5, max: 240 } },
  notes: { type: DataTypes.STRING(2000), field: 'observacoes', allowNull: true },
  motivo: { type: DataTypes.STRING(200), allowNull: true },
  status: { type: DataTypes.ENUM('agendado', 'concluido', 'cancelado'), allowNull: false, defaultValue: 'agendado' }
}, { tableName: 'appointments', timestamps: true });
