export const tokenUtils = {
  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage?.getItem('token') || sessionStorage?.getItem('token');
    }
    return null;
  },
  
  set: (token, remember = false) => {
    if (typeof window !== 'undefined') {
      if (remember) {
        localStorage?.setItem('token', token);
        sessionStorage?.removeItem('token');
      } else {
        sessionStorage?.setItem('token', token);
        localStorage?.removeItem('token');
      }
    }
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage?.removeItem('token');
      sessionStorage?.removeItem('token');
    }
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