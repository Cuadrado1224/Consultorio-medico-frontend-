import { tokenUtils } from '../utils/TokenUtils';
import config from '../config';

const baseURL = (config.apiUrl || '').replace(/\/+$/, '/')
const endpoints = {
  login: 'login',
  centrosMedicos:'Administracion/CentrosMedicos',
  consultas: 'CentroMedico/Consultas'
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
    let resp;
    try {
      resp = await fetch(url, { ...options, headers });
    } catch (networkErr) {
      throw new Error(`NETWORK_ERROR: ${networkErr.message}`);
    }
    if (!resp.ok) {
      let bodyText = '';
      try { bodyText = await resp.text(); } catch { /* ignore */ }
      const snippet = bodyText?.slice(0,200);
      throw new Error(`HTTP ${resp.status}${resp.statusText ? ': '+resp.statusText : ''}${snippet ? ' :: '+snippet : ''}`);
    }
    try {
      return await resp.json();
    } catch (parseErr) {
      throw new Error(`PARSE_ERROR: ${parseErr.message}`);
    }
  }


  async login(credentials) {
    const resp = await fetch(`${baseURL}${endpoints.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!resp.ok) throw new Error('LOGIN_ERROR');
   
    let text = await resp.text();
    let token = text;
    try {
      const parsed = JSON.parse(text);
      // Soportar múltiples claves devueltas por el backend
      if (parsed) {
        if (parsed.token) token = parsed.token;
        else if (parsed.accessToken) token = parsed.accessToken;
        else if (parsed.token_) token = parsed.token_; // caso mostrado por el usuario
      }
    } catch { /* texto plano */ }
    if (typeof token === 'string') token = token.trim();
    return { token, user: { username: credentials.nombreUsuario, nombre: credentials.nombreUsuario } };
  }
  async getCentrosMedicos() {
    return this.request(endpoints.centrosMedicos);
  }
    async createCentroMedico(data) {  
    return this.request(endpoints.centrosMedicos, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Métodos para gestión de consultas médicas
  async getConsultas(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.medicoId) params.append('empleadoId', filtros.medicoId);
    if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);
    
    const queryString = params.toString();
    const url = queryString ? `${endpoints.consultas}?${queryString}` : endpoints.consultas;
    return this.request(url);
  }

  async getConsultaById(id) {
    return this.request(`${endpoints.consultas}/${id}`);
  }

  async createConsulta(data) {
    return this.request(endpoints.consultas, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateConsulta(id, data) {
    return this.request(`${endpoints.consultas}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteConsulta(id) {
    return this.request(`${endpoints.consultas}/${id}`, {
      method: 'DELETE'
    });
  }

  // Métodos de compatibilidad (alias)
  async getCitas(filtros = {}) {
    return this.getConsultas(filtros);
  }

  async getCitaById(id) {
    return this.getConsultaById(id);
  }

  async createCita(data) {
    return this.createConsulta(data);
  }

  async updateCita(id, data) {
    return this.updateConsulta(id, data);
  }

  async deleteCita(id) {
    return this.deleteConsulta(id);
  }

  // Métodos para obtener datos necesarios
  async getPacientes() {
    return this.request('CentroMedico/Pacientes');
  }

  async getEmpleados() {
    return this.request('Administracion/Empleados');
  }
}

export const apiService = new ApiService();