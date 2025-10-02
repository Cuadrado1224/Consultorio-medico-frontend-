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
      console.log(`[Cookie] Creando cookie persistente '${name}' que expira en: ${date.toLocaleString()}`);
    } else {
      console.log(`[Cookie] Creando session cookie '${name}' (se elimina al cerrar navegador)`);
    }
    
    // Agregar Secure solo en HTTPS
    if (location.protocol === 'https:') {
      cookieString += '; Secure';
    }
    
    document.cookie = cookieString;
    console.log(`[Cookie] Cookie creada: ${cookieString}`);
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
        console.log(`[Cookie] Cookie '${name}' encontrada: ${value.substring(0, 20)}...`);
        return value;
      }
    }
    console.log(`[Cookie] Cookie '${name}' no encontrada`);
    return null;
  },
  
  remove: (name) => {
    if (typeof window === 'undefined') return;
    console.log(`[Cookie] Eliminando cookie '${name}'`);
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

export const tokenUtils = {
  get: () => {
    if (typeof window === 'undefined') return null;
    
    console.log(`[TokenUtils] Obteniendo token...`);
    
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
    
    console.log(`[TokenUtils] No se encontró token`);
    return null;
  },
  
  set: (token, remember = false) => {
    if (typeof window === 'undefined') return;
    
    if (typeof token === 'string') {
      token = token.trim();
    }
    
    console.log(`[TokenUtils] Guardando token, remember=${remember}`);
    
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
    
    console.log(`[TokenUtils] Eliminando todos los tokens`);
    // Limpiar ambos tipos de cookies
    cookieUtils.remove('authToken');
    cookieUtils.remove('sessionToken');
  },
  
  isExpired: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      console.log(`[TokenUtils] Token ${isExpired ? 'EXPIRADO' : 'VÁLIDO'}, exp: ${new Date(payload.exp * 1000).toLocaleString()}`);
      return isExpired;
    } catch {
      console.log(`[TokenUtils] Error al verificar expiración del token`);
      return true;
    }
  }
};