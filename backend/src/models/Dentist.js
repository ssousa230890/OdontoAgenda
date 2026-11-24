// models/Dentist.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dentist = sequelize.define('Dentist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cro: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    especialidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    tableName: 'dentists',
    timestamps: true,
  });

  return Dentist;
};
