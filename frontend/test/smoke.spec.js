import fs from 'node:fs';
import { test, expect } from '@playwright/test';
const admin = { id: 1, nomeCompleto: 'Equipe demonstração', nomeGuerra: 'Teste', postoGraduacao: 'Civil', perfil: 'admin', om: 'Teste' };
const token = 'e30.'+Buffer.from(JSON.stringify({ id: 1, exp: Math.floor(Date.now()/1000)+3600 })).toString('base64url')+'.fixture';
async function mockApi(page, user=admin) {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let data = [];
    if(url.pathname.endsWith('/auth/login')) data = { token, usuario: user };
    if(url.pathname.endsWith('/auth/me')) data = user;
    if(route.request().method()==='POST' && url.pathname.endsWith('/patients')) data = {id:1,...route.request().postDataJSON()};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
}
test('login, painel, cadastros e agenda renderizam sem erro', async ({page}) => {
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await mockApi(page);
  await page.goto('/');await expect(page).toHaveURL(/login/);
  if(process.env.CAPTURE_UI){fs.mkdirSync('../docs/screenshots',{recursive:true});await page.screenshot({path:'../docs/screenshots/login.png',fullPage:true});}
  await page.getByLabel('CPF',{exact:true}).fill('52998224725');
  await page.getByLabel('Senha',{exact:true}).fill('fixture-password');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Olá, Teste'})).toBeVisible();
  if(process.env.CAPTURE_UI)await page.screenshot({path:'../docs/screenshots/dashboard.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  if(process.env.CAPTURE_UI)await page.screenshot({path:'../docs/screenshots/mobile.png',fullPage:true});
  await page.setViewportSize({width:1280,height:720});
  await page.getByRole('link',{name:'Pacientes',exact:true}).click();
  await page.getByLabel('Nome completo').fill('Paciente de teste');
  await page.getByLabel('CPF',{exact:false}).fill('98765432100');
  await page.getByLabel('Posto / graduação').fill('Civil');
  await page.getByLabel('Organização militar').fill('Teste');
  await page.getByRole('button',{name:'Salvar cadastro'}).click();
  await expect(page.getByRole('status')).toHaveText('Cadastro salvo.');
  await page.getByRole('link',{name:'Dentistas',exact:true}).click();
  await expect(page.getByLabel('CRO / UF')).toBeVisible();
  await page.getByRole('link',{name:'Agenda',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Agenda odontológica'})).toBeVisible();
  await expect(page.getByLabel('Duração (minutos)')).toHaveValue('30');
  await page.getByRole('link',{name:'Usuários',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Usuários e permissões'})).toBeVisible();
  await page.getByRole('button',{name:'Sair',exact:true}).click();
  await expect(page.getByRole('button',{name:'Entrar',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
test('dentista consulta agenda e não recebe formulários administrativos',async({page})=>{
  const user={...admin,perfil:'dentista'};await mockApi(page,user);
  await page.addInitScript(({token,user})=>{localStorage.setItem('token',token);localStorage.setItem('user',JSON.stringify(user));},{token,user});
  await page.goto('/patients');await expect(page.getByRole('heading',{name:'Pacientes',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Salvar cadastro'})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Usuários',exact:true})).toHaveCount(0);
  await page.getByRole('link',{name:'Agenda',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Novo agendamento'})).toHaveCount(0);
});
