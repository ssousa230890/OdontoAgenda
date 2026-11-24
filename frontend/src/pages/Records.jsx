import React, { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api'; import { getUser } from '../session';
const definitions = {
  patients: { title: 'Pacientes', singular: 'paciente', fields: [
    ['nomeCompleto','Nome completo',true],['cpf','CPF',true],['postoGraduacao','Posto / graduação',true],['om','Organização militar',true],
    ['nomeGuerra','Nome de guerra'],['identidadeMilitar','Identidade militar'],['dataNascimento','Nascimento',false,'date'],
    ['email','E-mail',false,'email'],['telefone','Telefone',false,'tel'],['address','Endereço']
  ], columns: ['nomeCompleto','postoGraduacao','om','telefone'] },
  dentists: { title: 'Dentistas', singular: 'dentista', fields: [['nome','Nome completo',true],['cro','CRO / UF',true],['especialidade','Especialidade']], columns: ['nome','cro','especialidade'] }
};
export default function Records({kind}) {
  const config = definitions[kind]; const empty = () => Object.fromEntries(config.fields.map(([key]) => [key,'']));
  const [form,setForm] = useState(empty); const [items,setItems] = useState([]); const [id,setId] = useState(null);
  const [error,setError] = useState(''); const [success,setSuccess] = useState(''); const [loading,setLoading] = useState(true); const [busy,setBusy] = useState(false); const [search,setSearch] = useState('');
  const role = getUser()?.perfil; const canWrite = role === 'admin' || (kind === 'patients' && role === 'recepcionista');
  async function load() { try { const { data } = await api.get('/'+kind); setItems(data); } catch(err) { setError(errorMessage(err)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, [kind]);
  function reset() { setForm(empty()); setId(null); }
  async function save(event) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try { if (id) await api.put('/'+kind+'/'+id, form); else await api.post('/'+kind, form); reset(); setSuccess('Cadastro salvo.'); await load(); }
    catch(err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  async function remove(item) {
    if (!window.confirm('Excluir este cadastro? Cadastros com agendamentos serão preservados.')) return;
    setError(''); setSuccess(''); setBusy(true);
    try { await api.delete('/'+kind+'/'+item.id); if (id === item.id) reset(); setSuccess('Cadastro excluído.'); await load(); } catch(err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  const filtered = items.filter(item => config.fields.some(([key]) => String(item[key] || '').toLowerCase().includes(search.toLowerCase())));
  return <><div className="page-heading"><div><span className="eyebrow">CADASTROS</span><h1>{config.title}</h1></div><span className="badge">{items.length} registros</span></div>
    {error && <p role="alert" className="notice error">{error}</p>}{success && <p role="status" className="notice success">{success}</p>}
    {canWrite && <section className="card"><h2>{id ? 'Editar' : 'Cadastrar'} {config.singular}</h2><form onSubmit={save}><div className="form-grid">
      {config.fields.map(([key,label,required,type]) => <div key={key}><label htmlFor={key}>{label}{required ? ' *' : ''}</label><input id={key} required={!!required} type={type || 'text'} value={form[key]} maxLength={key === 'cpf' ? 14 : key === 'address' ? 200 : key === 'postoGraduacao' || key === 'identidadeMilitar' ? 40 : key === 'om' ? 80 : key === 'telefone' ? 20 : key === 'nomeGuerra' ? 60 : kind === 'dentists' ? (key === 'cro' ? 30 : 100) : 120} onChange={e => setForm({...form,[key]:e.target.value})} /></div>)}
    </div><div className="actions"><button disabled={busy}>{busy ? 'Salvando…' : 'Salvar cadastro'}</button>{id && <button type="button" className="secondary" onClick={reset}>Cancelar edição</button>}</div></form></section>}
    <section className="card"><div className="section-heading"><h2>Cadastros</h2><input className="search" aria-label="Buscar cadastros" placeholder="Buscar?" value={search} onChange={e=>setSearch(e.target.value)} /></div>
      {loading ? <p aria-busy="true">Carregando…</p> : <div className="table-wrap"><table><thead><tr>{config.columns.map(key => <th key={key}>{config.fields.find(f=>f[0]===key)[1]}</th>)}{canWrite && <th>Ações</th>}</tr></thead><tbody>
        {!filtered.length && <tr><td colSpan={config.columns.length+1}>Nenhum registro encontrado.</td></tr>}
        {filtered.map(item => <tr key={item.id}>{config.columns.map(key => <td key={key}>{item[key] || '—'}</td>)}{canWrite && <td className="actions"><button className="secondary" disabled={busy} onClick={()=>{setId(item.id);setForm(Object.fromEntries(config.fields.map(([key])=>[key,item[key] || ''])));setSuccess('');window.scrollTo({top:0,behavior:'smooth'});}}>Editar</button>{role==='admin' && <button className="danger" disabled={busy} onClick={()=>remove(item)}>Excluir</button>}</td>}</tr>)}
      </tbody></table></div>}</section></>;
}
