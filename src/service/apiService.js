import { tokenUtils } from '../utils/TokenUtils';
import config from '../config';

const baseURL = (config.apiUrl || '').replace(/\/+$/, '/')
const endpoints = {
  login: 'login',
  patients: 'Administracion/Usuarios'
};

class ApiService {
  async request(path, options = {}) {
    const token = tokenUtils.get();
    const url = `${baseURL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };
    const resp = await fetch(url, { ...options, headers });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }


  async login(credentials) {
    const resp = await fetch(`${baseURL}${endpoints.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!resp.ok) throw new Error('LOGIN_ERROR');
    // Revertimos a caso simple: responde JSON { token } o string token
    let text = await resp.text();
    let token = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.token) token = parsed.token;
    } catch { /* texto plano */ }
    return { token, user: { username: credentials.nombreUsuario, nombre: credentials.nombreUsuario } };
  }

  async getPatients() {
    return this.request(endpoints.patients);
  }

}

export const apiService = new ApiService();