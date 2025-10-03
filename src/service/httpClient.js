import axios from 'axios';
import config from '../config';
import { tokenUtils } from '../utils/TokenUtils';

const baseURL = (config.apiUrl || '').replace(/\/+$/, '/');

const endpoints = {
  login: 'login',
  centrosMedicos: 'Administracion/CentrosMedicos',
  consultas: 'CentroMedico/Consultas',
  pacientes: 'CentroMedico/Pacientes',
  empleados: 'Administracion/Empleados'
};

export const http = axios.create({
  baseURL,
  timeout: 30000
});

http.interceptors.request.use((req) => {
  const token = tokenUtils.get();
  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const snippet = typeof data === 'string' ? data.slice(0, 200) : JSON.stringify(data).slice(0, 200);
      return Promise.reject(new Error(`HTTP ${status}: ${snippet}`));
    }
    if (error.request) {
      return Promise.reject(new Error(`NETWORK_ERROR: Sin respuesta del servidor`));
    }
    return Promise.reject(new Error(`REQUEST_ERROR: ${error.message}`));
  }
);

http.getCitas = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
  if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
  if (filtros.medicoId) params.append('empleadoId', filtros.medicoId);
  if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);
  
  const queryString = params.toString();
  const url = queryString ? `${endpoints.consultas}?${queryString}` : endpoints.consultas;
  
  const response = await http.get(url);
  return response.data;
};

http.getPacientes = async () => {
  const response = await http.get(endpoints.pacientes);
  return response.data;
};

export default http;
