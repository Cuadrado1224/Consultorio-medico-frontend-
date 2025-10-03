import React, { createContext, useContext, useState } from 'react';
import { tokenUtils } from '../utils/TokenUtils';
import { http } from '../service/httpClient';

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
  const [token, setToken] = useState(tokenUtils.get());
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const login = async (credentials, remember = false) => {
    try {
      const { data, status } = await http.post('login', credentials, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (status < 200 || status >= 300) throw new Error('LOGIN_ERROR');
      let token = data;
      if (data && typeof data === 'object') {
        token = data.token || data.accessToken || data.token_ || '';
      }
      if (typeof token === 'string') token = token.trim();
      if (!token) throw new Error('SIN_TOKEN');

      const userData = data?.user || {
        username: credentials.nombreUsuario,
        name: data?.nombre || credentials.nombreUsuario,
        email: data?.email || '',
        roles: data?.roles || [],
        permisos: data?.permisos || [],
        tipoEmpleado: data?.tipoEmpleado || '',
        tipoEmpleadoID: data?.tipoEmpleadoID || null,
        idEmpleado: data?.idEmpleado || '',
        especialidad: data?.especialidad || ''
      };
    
      const roles = data?.roles || userData.roles || [];
      const expiresAt = data?.expiresAt || null;

      tokenUtils.set(token, remember);
      setToken(token);
      setUser({ ...userData, roles, expiresAt });
      setIsAuthenticated(true);

      return {
        success: true,
        token,
        user: { ...userData, roles, expiresAt },
        roles,
        expiresAt
      };
    } catch (error) {
      console.error('[AuthContext] Error en login:', error?.message);
      let friendly = 'Error de conexión. Intenta nuevamente.';
      if (error.message === 'LOGIN_ERROR' || error.message.includes('401')) {
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
    setToken(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    // Verificar por ID del tipo de empleado (1 = Administrador)
    if (user?.tipoEmpleadoID === 1) return true;
    // Fallback: verificar por texto del tipo de empleado
    if (user?.tipoEmpleado) {
      const tipo = user.tipoEmpleado.toLowerCase();
      return tipo.includes('administrador') || tipo === 'admin';
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
