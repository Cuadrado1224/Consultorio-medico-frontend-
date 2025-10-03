import axios from 'axios';
import config from '../config';
import { tokenUtils } from '../utils/TokenUtils';

const baseURL = (config.apiUrl || '').replace(/\/+$/, '/');

// Endpoints principales
const endpoints = {
  login: 'login',
  centrosMedicos: 'Administracion/CentrosMedicos',
  consultas: 'CentroMedico/Consultas',
  pacientes: 'CentroMedico/Pacientes',
  empleados: 'Administracion/Empleados'
};

export const http = axios.create({
  baseURL,
  timeout: 12000 // 12s por defecto
});

http.interceptors.request.use((req) => {
  console.log('Request interceptor - URL:', req.url); // Debug
  console.log('Request interceptor - baseURL:', req.baseURL); // Debug
  console.log('Request interceptor - method:', req.method); // Debug
  
  const token = tokenUtils.get();
  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
    console.log('Token agregado a request'); // Debug
  } else {
    console.log('No hay token disponible'); // Debug
  }
  return req;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('Error interceptado:', error); // Debug
    console.error('Error config:', error.config); // Debug
    console.error('Error response:', error.response); // Debug
    console.error('Error request:', error.request); // Debug
    
    if (error.response) {
      const { status, data } = error.response;
      const snippet = typeof data === 'string' ? data.slice(0, 200) : JSON.stringify(data).slice(0, 200);
      return Promise.reject(new Error(`HTTP ${status}: ${snippet}`));
    }
    if (error.request) {
      console.error('URL que falló:', error.config?.url); // Debug
      return Promise.reject(new Error(`NETWORK_ERROR: Sin respuesta del servidor. URL: ${error.config?.url}`));
    }
    return Promise.reject(new Error(`REQUEST_SETUP_ERROR: ${error.message}`));
  }
);

// Método para login personalizado (manteniendo la lógica específica)
http.login = async (credentials) => {
  try {
    const response = await fetch(`${baseURL}${endpoints.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) throw new Error('LOGIN_ERROR');
   
    let text = await response.text();
    let token = text;
    
    try {
      const parsed = JSON.parse(text);
      // Soportar múltiples claves devueltas por el backend
      if (parsed) {
        if (parsed.token) token = parsed.token;
        else if (parsed.accessToken) token = parsed.accessToken;
        else if (parsed.token_) token = parsed.token_;
      }
    } catch { /* texto plano */ }
    
    if (typeof token === 'string') token = token.trim();
    return { token, user: { username: credentials.nombreUsuario, nombre: credentials.nombreUsuario } };
  } catch (error) {
    throw new Error(`LOGIN_ERROR: ${error.message}`);
  }
};

// Métodos para Centros Médicos
http.getCentrosMedicos = async () => {
  const response = await http.get(endpoints.centrosMedicos);
  return response.data;
};

http.createCentroMedico = async (data) => {
  const response = await http.post(endpoints.centrosMedicos, data);
  return response.data;
};

// Métodos para gestión de consultas médicas
http.getConsultas = async (filtros = {}) => {
  console.log('getConsultas llamado con filtros:', filtros); // Debug
  const params = new URLSearchParams();
  if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
  if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
  if (filtros.medicoId) params.append('empleadoId', filtros.medicoId);
  if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);
  
  const queryString = params.toString();
  const url = queryString ? `${endpoints.consultas}?${queryString}` : endpoints.consultas;
  console.log('URL construida:', url); // Debug
  console.log('URL completa con baseURL:', `${baseURL}${url}`); // Debug
  
  const response = await http.get(url);
  return response.data;
};

http.getConsultaById = async (id) => {
  const response = await http.get(`${endpoints.consultas}/${id}`);
  return response.data;
};

http.createConsulta = async (data) => {
  const response = await http.post(endpoints.consultas, data);
  return response.data;
};

http.updateConsulta = async (id, data) => {
  const response = await http.put(`${endpoints.consultas}/${id}`, data);
  return response.data;
};

http.deleteConsulta = async (id, consultaCompleta = null) => {
  // Si tenemos el objeto completo, enviarlo en el cuerpo de la petición
  if (consultaCompleta) {
    console.log('Enviando delete con objeto completo:', consultaCompleta); // Debug
    const response = await http.delete(`${endpoints.consultas}/${id}`, {
      data: consultaCompleta
    });
    return response.data;
  } else {
    // Fallback: solo el ID (puede no funcionar dependiendo del backend)
    console.log('Enviando delete solo con ID:', id); // Debug
    const response = await http.delete(`${endpoints.consultas}/${id}`);
    return response.data;
  }
};

// Métodos de compatibilidad (alias para citas)
http.getCitas = async (filtros = {}) => {
  return http.getConsultas(filtros);
};

http.getCitaById = async (id) => {
  return http.getConsultaById(id);
};

http.createCita = async (data) => {
  return http.createConsulta(data);
};

http.updateCita = async (id, data) => {
  return http.updateConsulta(id, data);
};

http.deleteCita = async (id, citaCompleta = null) => {
  return http.deleteConsulta(id, citaCompleta);
};

// Métodos para obtener datos necesarios
http.getPacientes = async () => {
  const response = await http.get(endpoints.pacientes);
  return response.data;
};

http.getEmpleados = async () => {
  const response = await http.get(endpoints.empleados);
  return response.data;
};

// Método de prueba simple
http.testConnection = async () => {
  try {
    console.log('Probando conexión básica...');
    console.log('baseURL configurada:', baseURL);
    const response = await http.get('/');
    console.log('Conexión exitosa:', response);
    return response.data;
  } catch (error) {
    console.error('Error en conexión de prueba:', error);
    throw error;
  }
};
