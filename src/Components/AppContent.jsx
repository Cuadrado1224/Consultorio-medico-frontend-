import React from 'react'
import { useAuth } from '../context/AuthContext';
import LoginScreen from './Login';
import Dashboard from './Dashboard';
import LoadingScreen from './LoadingScreen';
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Dashboard /> : <LoginScreen />;
};

export default AppContent