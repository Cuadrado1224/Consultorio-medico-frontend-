// Funciones auxiliares para manejo de cookies
const cookieUtils = {
  set: (name, value, expirationMinutes = null) => {
    if (typeof window === 'undefined') return;

    let cookieString = `${name}=${value}; path=/; SameSite=Strict`;

    // Solo agregar expires si se especifica (cookie persistente)
    if (expirationMinutes !== null) {
      const date = new Date();
      date.setTime(date.getTime() + (expirationMinutes * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;

    }

    // Agregar Secure solo en HTTPS
    if (location.protocol === 'https:') {
      cookieString += '; Secure';
    }

    document.cookie = cookieString;

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
        const value = cookie.substring(nameEQ.length, cookie.length);

        return value;
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
      // Session cookie - se elimina automáticamente al cerrar el navegador
      cookieUtils.set('sessionToken', token); // SIN expirationMinutes = session cookie
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
      const isExpired = payload.exp * 1000 < Date.now();
      window.location.href = '/login';
      return isExpired;
    } catch {

      return true;
    }
  }
};