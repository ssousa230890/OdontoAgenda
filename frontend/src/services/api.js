import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 15000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.assign('/login');
  }
  return Promise.reject(error);
});
export const errorMessage = error => error.response?.data?.error || 'Não foi possível concluir a operação. Verifique a conexão e tente novamente.';
export default api;
