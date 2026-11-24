import React, { useEffect, useState } from 'react'; import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api'; import { getUser } from '../session';
export default function Dashboard(){
  const [data,setData]=useState(null);const [error,setError]=useState('');const user=getUser();
  useEffect(()=>{Promise.all([api.get('/patients'),api.get('/dentists'),api.get('/appointments')]).then(([p,d,a])=>setData({patients:p.data.length,dentists:d.data.length,appointments:a.data})).catch(err=>setError(errorMessage(err)));},[]);
  const today=new Date().toLocaleDateString('pt-BR');
  const appointments=data?.appointments.filter(a=>new Date(a.date).toLocaleDateString('pt-BR')===today&&a.status==='agendado')||[];
  return <><div className="page-heading"><div><span className="eyebrow">VISÃO GERAL · {today}</span><h1>Olá, {user?.nomeGuerra || user?.nomeCompleto}</h1><p>Acompanhe os atendimentos da sua unidade.</p></div><Link className="button" to="/appointments">Abrir agenda</Link></div>
    {error&&<p role="alert" className="notice error">{error}</p>}{!data&&!error?<p aria-busy="true">Carregando indicadores…</p>:data&&<><div className="stats"><Link to="/patients" className="card"><span>Pacientes cadastrados</span><strong>{data.patients}</strong></Link><Link to="/dentists" className="card"><span>Dentistas</span><strong>{data.dentists}</strong></Link><Link to="/appointments" className="card"><span>Agendados para hoje</span><strong>{appointments.length}</strong></Link></div>
    <section className="card"><h2>Agenda de hoje</h2>{!appointments.length?<p>Nenhum atendimento agendado para hoje.</p>:<div className="table-wrap"><table><thead><tr><th>Horário</th><th>Paciente</th><th>Dentista</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>{new Date(a.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td><td>{a.Patient?.nomeCompleto}</td><td>{a.Dentist?.nome}</td></tr>)}</tbody></table></div>}</section></>}</>;
}
