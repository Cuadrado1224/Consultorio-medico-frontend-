import axios from 'axios';
import config from '../config';
import { tokenUtils } from '../utils/TokenUtils';


const baseURL = (config.apiUrl || '').replace(/\/+$/, '/');

export const http = axios.create({
  baseURL,
  timeout: 10000 // 10s por defecto
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
      return Promise.reject(new Error('NETWORK_ERROR: Sin respuesta del servidor'));
    }
    return Promise.reject(new Error(`REQUEST_SETUP_ERROR: ${error.message}`));
  }
);
