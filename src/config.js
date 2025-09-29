const raw = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'https://localhost:7207/';
const apiUrl = raw.replace(/\/+$/, '/');

const config = { apiUrl };

export default config;