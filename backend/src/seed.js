const { cpf, required, fail } = require('./http');
module.exports = async ({ User }) => {
  if (await User.findOne({ where: { perfil: 'admin' } })) return;
  const data = {
    nomeCompleto: process.env.ADMIN_NAME, nomeGuerra: process.env.ADMIN_WAR_NAME,
    postoGraduacao: process.env.ADMIN_RANK, identidadeMilitar: process.env.ADMIN_MILITARY_ID,
    om: process.env.ADMIN_OM, senha: process.env.ADMIN_PASSWORD, perfil: 'admin', ativo: true
  };
  required(data, ['nomeCompleto','nomeGuerra','postoGraduacao','identidadeMilitar','om','senha']);
  data.cpf = cpf(process.env.ADMIN_CPF);
  if (data.senha.length < 12 || Buffer.byteLength(data.senha) > 72) fail(400, 'ADMIN_PASSWORD deve ter pelo menos 12 caracteres e no máximo 72 bytes.');
  await User.create(data);
  console.log('Administrador inicial criado.');
};
