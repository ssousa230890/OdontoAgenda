import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import Login from './pages/Login'; import Dashboard from './pages/Dashboard';
import Records from './pages/Records'; import Appointments from './pages/Appointments';
import Users from './pages/Users'; import Account from './pages/Account';
import api from './services/api'; import { getUser, isAuthenticated, logout } from './session';
import './App.css';
function PrivateLayout() {
  const [ready, setReady] = useState(false); const [error, setError] = useState('');
  const location = useLocation();
  useEffect(() => {
    let active = true;
    if (isAuthenticated()) api.get('/auth/me').then(({data}) => {
      localStorage.setItem('user', JSON.stringify(data)); if (active) setReady(true);
    }).catch(() => { if (active) setError('Não foi possível carregar sua sessão. Recarregue a página para tentar novamente.'); });
    return () => { active = false; };
  }, []);
  useEffect(() => { const timer = setInterval(() => { if (!isAuthenticated()) logout(); }, 30000); return () => clearInterval(timer); }, []);
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (error) return <main><p role="alert">{error}</p><button onClick={logout}>Voltar ao login</button></main>;
  if (!ready) return <main aria-busy="true">Carregando sessão…</main>;
  const user = getUser();
  return <><header><NavLink className="brand" to="/">OdontoAgenda<span>Militar</span></NavLink><nav aria-label="Navegação principal">
    <NavLink to="/" end>Início</NavLink><NavLink to="/patients">Pacientes</NavLink><NavLink to="/dentists">Dentistas</NavLink><NavLink to="/appointments">Agenda</NavLink>
    {user?.perfil === 'admin' && <NavLink to="/users">Usuários</NavLink>}<NavLink to="/account">Minha conta</NavLink></nav>
    <div className="identity"><span>{user?.postoGraduacao} {user?.nomeGuerra}</span><button className="secondary" onClick={logout}>Sair</button></div></header>
    <main key={location.pathname}><Outlet /></main><footer>Desenvolvido por Antonio Carlos da Silva Sousa Júnior · OdontoAgenda Militar</footer></>;
}
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />} />
    <Route element={<PrivateLayout />}>
      <Route index element={<Dashboard />} /><Route path="patients" element={<Records kind="patients" />} />
      <Route path="dentists" element={<Records kind="dentists" />} /><Route path="appointments" element={<Appointments />} />
      <Route path="users" element={<Users />} /><Route path="account" element={<Account />} />
    </Route><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
