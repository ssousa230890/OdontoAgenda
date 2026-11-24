import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
export default function Login() {
  const [cpf, setCpf] = useState(''); const [senha, setSenha] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { cpf, senha });
      localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.usuario));
      navigate('/', { replace: true });
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <section className="login-card"><span className="eyebrow">GESTÃO ODONTOLÓGICA MILITAR</span><h1>OdontoAgenda</h1><p>Acesse a agenda e os cadastros da sua unidade.</p>
    {error && <div role="alert" className="notice error">{error}</div>}
    <form onSubmit={submit}><label htmlFor="cpf">CPF</label><input id="cpf" autoComplete="username" inputMode="numeric" maxLength={14} value={cpf} onChange={e => setCpf(e.target.value)} required />
      <label htmlFor="senha">Senha</label><input id="senha" type="password" autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} required />
      <button disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form><small>O primeiro acesso é configurado pelo responsável pela instalação.</small></section>;
}
