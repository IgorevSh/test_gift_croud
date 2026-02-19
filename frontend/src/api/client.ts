import axios, { AxiosHeaders } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const headersAny: any = config.headers ?? new AxiosHeaders();
    // Axios v1 may use AxiosHeaders; prefer .set when available
    if (typeof headersAny.set === 'function') {
      headersAny.set('Authorization', `Bearer ${token}`);
      headersAny.set('X-Auth-Token', token);
    } else {
      headersAny.Authorization = `Bearer ${token}`;
      headersAny['X-Auth-Token'] = token;
    }
    config.headers = headersAny;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const hadAuth = err.config?.headers?.Authorization ?? err.config?.headers?.authorization;
      if (hadAuth) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
