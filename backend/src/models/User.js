const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = sequelize => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomeCompleto: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
    nomeGuerra: { type: DataTypes.STRING(60), allowNull: false, validate: { notEmpty: true } },
    postoGraduacao: { type: DataTypes.STRING(40), allowNull: false, validate: { notEmpty: true } },
    identidadeMilitar: { type: DataTypes.STRING(40), allowNull: false, validate: { notEmpty: true } },
    cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
    om: { type: DataTypes.STRING(80), allowNull: false, validate: { notEmpty: true } },
    email: { type: DataTypes.STRING(120), allowNull: true, validate: { isEmail: true } },
    senha: { type: DataTypes.STRING, allowNull: false },
    perfil: { type: DataTypes.ENUM('admin', 'dentista', 'recepcionista'), allowNull: false, defaultValue: 'recepcionista', validate: { isIn: [['admin','dentista','recepcionista']] } },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, { tableName: 'users', timestamps: true });
  const hashPassword = async user => { if (user.changed('senha')) user.senha = await bcrypt.hash(user.senha, 12); };
  User.beforeCreate(hashPassword); User.beforeUpdate(hashPassword);
  User.prototype.validarSenha = function(value) { return bcrypt.compare(value, this.senha); };
  return User;
};
