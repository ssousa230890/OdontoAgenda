import React, { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api'; import { getUser } from '../session';
const empty = { patientId:'', dentistId:'', date:'', duration_minutes:30, notes:'', status:'agendado' };
const localDate = value => { const d = new Date(value); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); };
const labels = { agendado:'Agendado', concluido:'Concluído', cancelado:'Cancelado' };
export default function Appointments() {
  const [items,setItems]=useState([]); const [patients,setPatients]=useState([]); const [dentists,setDentists]=useState([]);
  const [form,setForm]=useState(empty); const [id,setId]=useState(null); const [error,setError]=useState(''); const [success,setSuccess]=useState(''); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false);
  const [day,setDay]=useState(''); const [filter,setFilter]=useState(''); const role=getUser()?.perfil;
  async function load() {
    try { const [a,p,d]=await Promise.all([api.get('/appointments'),api.get('/patients'),api.get('/dentists')]); setItems(a.data);setPatients(p.data);setDentists(d.data); }
    catch(err){setError(errorMessage(err));} finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);
  function reset(){setForm(empty);setId(null);}
  async function save(event){
    event.preventDefault();setError('');setSuccess('');setBusy(true);
    try {
      const payload=role==='dentista' ? {status:form.status,notes:form.notes} : {...form,date:new Date(form.date).toISOString()};
      if(id) await api.put('/appointments/'+id,payload); else await api.post('/appointments',payload);
      reset();setSuccess('Agendamento salvo.');await load();
    }catch(err){setError(errorMessage(err));}finally{setBusy(false);}
  }
  async function remove(item){
    if(!window.confirm('Excluir definitivamente este agendamento?'))return;
    setBusy(true);setError('');setSuccess('');
    try{await api.delete('/appointments/'+item.id);if(id===item.id)reset();setSuccess('Agendamento excluído.');await load();}catch(err){setError(errorMessage(err));}finally{setBusy(false);}
  }
  const filtered=items.filter(a=>(!day || localDate(a.date).startsWith(day)) && (!filter || String(a.DentistId)===filter));
  return <><div className="page-heading"><div><span className="eyebrow">ATENDIMENTOS</span><h1>Agenda odontológica</h1></div><span className="badge">{items.filter(a=>a.status==='agendado').length} agendados</span></div>
    {error&&<p role="alert" className="notice error">{error}</p>}{success&&<p role="status" className="notice success">{success}</p>}
    {(role!=='dentista'||id)&&<section className="card"><h2>{id?'Editar atendimento':'Novo agendamento'}</h2><form onSubmit={save}><div className="form-grid">
      <div><label htmlFor="patient">Paciente *</label><select id="patient" required disabled={role==='dentista'} value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}><option value="">Selecione</option>{patients.map(p=><option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}</select></div>
      <div><label htmlFor="dentist">Dentista *</label><select id="dentist" required disabled={role==='dentista'} value={form.dentistId} onChange={e=>setForm({...form,dentistId:e.target.value})}><option value="">Selecione</option>{dentists.map(d=><option key={d.id} value={d.id}>{d.nome}</option>)}</select></div>
      <div><label htmlFor="date">Data e hora local *</label><input id="date" type="datetime-local" required disabled={role==='dentista'} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
      <div><label htmlFor="duration">Duração (minutos) *</label><input id="duration" type="number" min="5" max="240" required disabled={role==='dentista'} value={form.duration_minutes} onChange={e=>setForm({...form,duration_minutes:Number(e.target.value)})}/></div>
      <div><label htmlFor="status">Status</label><select id="status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
      <div className="wide"><label htmlFor="notes">Observações</label><textarea id="notes" maxLength={2000} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
    </div><div className="actions"><button disabled={busy}>{busy?'Salvando…':'Salvar atendimento'}</button>{id&&<button type="button" className="secondary" onClick={reset}>Cancelar edição</button>}</div></form><small>Horários exibidos no fuso do seu dispositivo. Conflitos do paciente e do dentista são verificados ao salvar.</small></section>}
    <section className="card"><div className="section-heading"><h2>Atendimentos</h2><div className="actions"><input aria-label="Filtrar por data" type="date" value={day} onChange={e=>setDay(e.target.value)}/><select aria-label="Filtrar por dentista" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Todos os dentistas</option>{dentists.map(d=><option key={d.id} value={d.id}>{d.nome}</option>)}</select></div></div>
      {loading?<p aria-busy="true">Carregando…</p>:<div className="table-wrap"><table><thead><tr><th>Data / hora</th><th>Paciente</th><th>Dentista</th><th>Duração</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {!filtered.length&&<tr><td colSpan="6">Nenhum atendimento encontrado.</td></tr>}{filtered.map(a=><tr key={a.id}><td>{new Date(a.date).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</td><td>{a.Patient?.nomeCompleto}</td><td>{a.Dentist?.nome}</td><td>{a.duration_minutes} min</td><td><span className={'status '+a.status}>{labels[a.status]}</span></td><td className="actions"><button className="secondary" disabled={busy} onClick={()=>{setId(a.id);setForm({patientId:a.PatientId,dentistId:a.DentistId,date:localDate(a.date),duration_minutes:a.duration_minutes,status:a.status,notes:a.notes||''});setSuccess('');window.scrollTo({top:0,behavior:'smooth'});}}>Editar</button>{role==='admin'&&<button className="danger" disabled={busy} onClick={()=>remove(a)}>Excluir</button>}</td></tr>)}
      </tbody></table></div>}</section></>;
}
