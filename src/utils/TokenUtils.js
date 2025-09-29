// Funciones auxiliares para manejo de cookies
const cookieUtils = {
  set: (name, value, expirationMinutes = 30) => {
    if (typeof window === 'undefined') return;
    
    const date = new Date();
    date.setTime(date.getTime() + (expirationMinutes * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    
    // Configurar cookie con seguridad
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict; Secure=${location.protocol === 'https:'}`;
  },
  
  get: (name) => {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  },
  
  remove: (name) => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

export const tokenUtils = {
  get: () => {
    if (typeof window === 'undefined') return null;
    
    // Obtener token del cookie persistente (remember = true)
    const persistentToken = cookieUtils.get('authToken');
    if (persistentToken) {
      return persistentToken;
    }
    
    // Obtener token del cookie de sesión (remember = false)
    const sessionToken = cookieUtils.get('sessionToken');
    if (sessionToken) {
      return sessionToken;
    }
    
    return null;
  },
  
  set: (token, remember = false) => {
    if (typeof window === 'undefined') return;
    
    if (typeof token === 'string') {
      token = token.trim();
    }
    
    if (remember) {
      // Cookie persistente con expiración de 30 minutos
      cookieUtils.set('authToken', token, 30);
      // Remover cookie de sesión si existía
      cookieUtils.remove('sessionToken');
    } else {
      // Cookie de sesión que expira al cerrar el navegador
      // Lo hacemos con una duración muy corta para simular sessionStorage
      cookieUtils.set('sessionToken', token, 480); // 8 horas como máximo para sesión
      // Remover cookie persistente si existía
      cookieUtils.remove('authToken');
    }
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    
    // Limpiar ambos tipos de cookies
    cookieUtils.remove('authToken');
    cookieUtils.remove('sessionToken');
  },
  
  isExpired: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};