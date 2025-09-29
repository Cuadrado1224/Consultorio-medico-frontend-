import React, { createContext, useContext, useState } from 'react';
import { tokenUtils } from '../utils/TokenUtils';
import { apiService } from '../service/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenUtils.get());

  const login = async (credentials, remember = false) => {
    try {
      if (import.meta.env.DEV) console.log('[AuthContext] intentando login', credentials);
      const { token, user: userData } = await apiService.login(credentials);
      if (!token) throw new Error('SIN_TOKEN');

      tokenUtils.set(token, remember);
      setUser(userData);
      setIsAuthenticated(true);
      if (import.meta.env.DEV) console.log('[AuthContext] login OK', userData);
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Error en login:', error.message);
      let friendly = 'Error de conexión. Intenta nuevamente.';
      if (error.message === 'CREDENCIALES_INVALIDAS' || error.message === 'HTTP 401: Unauthorized') {
        friendly = 'Credenciales incorrectas';
      } else if (error.message === 'SIN_TOKEN') {
        friendly = 'El servidor no devolvió token';
      }
      return { success: false, error: friendly };
    }
  };

  const logout = () => {
    tokenUtils.remove();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
