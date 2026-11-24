const { DataTypes } = require('sequelize');
module.exports = sequelize => sequelize.define('Patient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nomeCompleto: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
  nomeGuerra: { type: DataTypes.STRING(60), allowNull: true },
  cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
  postoGraduacao: { type: DataTypes.STRING(40), allowNull: false, validate: { notEmpty: true } },
  om: { type: DataTypes.STRING(80), allowNull: false, validate: { notEmpty: true } },
  email: { type: DataTypes.STRING(120), allowNull: true, validate: { isEmail: true } },
  telefone: { type: DataTypes.STRING(20), allowNull: true },
  address: { type: DataTypes.STRING(200), allowNull: true },
  identidadeMilitar: { type: DataTypes.STRING(40), allowNull: true },
  dataNascimento: { type: DataTypes.DATEONLY, allowNull: true, validate: { isDate: true } }
});
