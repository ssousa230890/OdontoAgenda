const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
if (process.env.NODE_ENV !== 'test' || !process.env.DB_NAME?.endsWith('_test')) throw new Error('Use somente um banco isolado terminado em _test e NODE_ENV=test.');
const sequelize = require('../src/database');
const models = require('../src/models/initModels')(sequelize);
const app = require('../src/app')(models, sequelize);
let server, base, token, receptionist, dentist;
const userData={nomeCompleto:'Conta de teste',nomeGuerra:'Teste',postoGraduacao:'Civil',identidadeMilitar:'TESTE',om:'Unidade teste',senha:'test-password-123!'};
async function request(route, method='GET', body, auth=token) {
  const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:response.status,data:response.status===204?null:await response.json()};
}
before(async()=>{
  await sequelize.sync({force:true});
  Object.assign(process.env, { ADMIN_NAME: userData.nomeCompleto, ADMIN_WAR_NAME: userData.nomeGuerra, ADMIN_RANK: userData.postoGraduacao, ADMIN_MILITARY_ID: userData.identidadeMilitar, ADMIN_OM: userData.om, ADMIN_PASSWORD: userData.senha, ADMIN_CPF: '52998224725' });
  await require('../src/seed')(models);
  await require('../src/seed')(models);
  assert.equal(await models.User.count(), 1);
  await models.User.create({...userData,cpf:'11144477735',perfil:'recepcionista'});
  await models.User.create({...userData,cpf:'12345678909',perfil:'dentista'});
  server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
  token=(await request('/auth/login','POST',{cpf:'529.982.247-25',senha:userData.senha},null)).data.token;
  receptionist=(await request('/auth/login','POST',{cpf:'11144477735',senha:userData.senha},null)).data.token;
  dentist=(await request('/auth/login','POST',{cpf:'12345678909',senha:userData.senha},null)).data.token;
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));await sequelize.close();});
test('fluxo completo da API e permissões',async t=>{
  let patient, doctor, doctor2, appointment;
  await t.test('saúde, login, token e usuário ativo',async()=>{
    assert.equal((await request('/health')).status,200);assert.ok(token);assert.ok(receptionist);assert.ok(dentist);
    assert.equal((await request('/patients','GET',null,null)).status,401);
    assert.equal((await request('/patients','GET',null,'invalid')).status,401);
    assert.equal((await request('/auth/login','POST',{cpf:'52998224725',senha:'errada'},null)).status,401);
    const me=await request('/auth/me');assert.equal(me.status,200);assert.equal(me.data.senha,undefined);
    assert.equal((await request('/users','GET',null,receptionist)).status,403);
  });
  await t.test('cadastros, normalização, edição e duplicidade',async()=>{
    const body={nomeCompleto:'Paciente teste',cpf:'987.654.321-00',postoGraduacao:'Civil',om:'Teste',email:'',dataNascimento:'2000-01-01',identidadeMilitar:'T123'};
    let result=await request('/patients','POST',body,receptionist);assert.equal(result.status,201);patient=result.data;
    assert.equal(patient.cpf,'98765432100');assert.equal(patient.dataNascimento,'2000-01-01');
    assert.equal((await request('/patients','POST',body)).status,409);
    assert.equal((await request('/patients','POST',{...body,cpf:'00000000000'})).status,400);
    assert.equal((await request('/patients/'+patient.id,'PUT',{telefone:'61999999999'},receptionist)).status,200);
    assert.equal((await request('/patients','POST',body,dentist)).status,403);
    assert.equal((await request('/dentists','POST',{nome:'Dentista',cro:'TEST-1'},receptionist)).status,403);
    doctor=(await request('/dentists','POST',{nome:'Dentista teste',cro:'TEST-1',especialidade:'Clínica'})).data;
    doctor2=(await request('/dentists','POST',{nome:'Outro dentista',cro:'TEST-2'})).data;
    assert.equal((await request('/dentists')).data.length,2);
  });
  const booking=()=>({patientId:patient.id,dentistId:doctor.id,date:'2026-12-01T10:00:00-03:00',duration_minutes:30,notes:'Teste'});
  await t.test('agendamento, conflitos, intervalos adjacentes e atualização',async()=>{
    let result=await request('/appointments','POST',booking(),receptionist);assert.equal(result.status,201);appointment=result.data;
    assert.equal((await request('/appointments')).data[0].Patient.nomeCompleto,'Paciente teste');
    assert.equal((await request('/appointments','POST',booking())).status,409);
    assert.equal((await request('/appointments','POST',{...booking(),dentistId:doctor2.id})).status,409);
    assert.equal((await request('/appointments','POST',{...booking(),duration_minutes:-1})).status,400);
    assert.equal((await request('/appointments','POST',{...booking(),patientId:999999})).status,400);
    assert.equal((await request('/appointments','POST',{...booking(),date:'2026-12-01T10:30:00-03:00'})).status,201);
    assert.equal((await request('/appointments/'+appointment.id,'PUT',{date:'2026-12-01T10:15:00-03:00'})).status,409);
    assert.equal((await request('/appointments/'+appointment.id,'PUT',{notes:'Atendido',status:'concluido'},dentist)).status,200);
    assert.equal((await request('/appointments/'+appointment.id,'PUT',{patientId:patient.id},dentist)).status,403);
    assert.equal((await request('/appointments','POST',{...booking(),date:'2026-12-02T10:00:00-03:00'},dentist)).status,403);
  });
  await t.test('cancelamento libera horário e cadastros vinculados são preservados',async()=>{
    assert.equal((await request('/appointments/'+appointment.id,'PUT',{status:'cancelado'},receptionist)).status,200);
    assert.equal((await request('/appointments','POST',booking())).status,201);
    assert.equal((await request('/patients/'+patient.id,'DELETE')).status,409);
    assert.equal((await request('/dentists/'+doctor.id,'DELETE')).status,409);
    assert.equal((await request('/appointments/'+appointment.id,'DELETE',null,receptionist)).status,403);
  });
  await t.test('reservas simultâneas não ocupam o mesmo intervalo',async()=>{
    const payload={...booking(),date:'2026-12-03T10:00:00-03:00'};
    const results=await Promise.all([request('/appointments','POST',payload),request('/appointments','POST',payload)]);
    assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
  });
  await t.test('usuários, desativação e alteração de senha',async()=>{
    const users=await request('/users');assert.equal(users.data.some(u=>u.senha),false);
    const disabled=users.data.find(u=>u.perfil==='recepcionista');
    assert.equal((await request('/users/'+disabled.id,'PUT',{ativo:false})).status,200);
    assert.equal((await request('/patients','GET',null,receptionist)).status,401);
    const me=(await request('/auth/me')).data;
    assert.equal((await request('/users/'+me.id,'PUT',{ativo:false})).status,400);
    assert.equal((await request('/auth/password','PUT',{senhaAtual:'errada',novaSenha:'updated-password-123!'})).status,400);
    assert.equal((await request('/auth/password','PUT',{senhaAtual:userData.senha,novaSenha:'updated-password-123!'})).status,200);
    assert.equal((await request('/auth/login','POST',{cpf:'52998224725',senha:'updated-password-123!'},null)).status,200);
    const created=await request('/users/register','POST',{...userData,cpf:'39053344705',perfil:'dentista'});
    assert.equal(created.status,201);assert.equal(created.data.senha,undefined);
  });
  await t.test('corpos inválidos e rotas desconhecidas',async()=>{
    assert.equal((await request('/inexistente')).status,404);
    const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(r.status,400);
  });
});
