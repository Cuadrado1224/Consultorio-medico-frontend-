import React, { useState, useEffect } from 'react';
import { 
  Heart, Hospital, Users, Calendar, Activity, UserPlus, FileText,
  Bell, Settings, LogOut, Stethoscope, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CentroMedico from './CentroMedico';
import Empleados from './Empleados';
import Resumen from './Resumen';
import Citas from './Citas';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const menuItems = [
    { id: 'employees', label: 'Empleados', icon: Users, path: 'Administracion/Empleados' },
    { id: 'patients', label: 'Centros Médicos', icon: Hospital, path: 'Administracion/CentrosMedicos' },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'medical-records', label: 'Historiales', icon: FileText },
    { id: 'staff', label: 'Personal', icon: Stethoscope },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'patients':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><CentroMedico /></div>;
      case 'employees':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><Empleados /></div>;
      case 'appointments':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><Citas /></div>;
      case 'medical-records':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h1 className="text-xl font-semibold mb-2">Historiales Médicos</h1><p className="text-gray-600 text-sm">Listado / búsqueda de historiales.</p></div>;
      case 'staff':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h1 className="text-xl font-semibold mb-2">Personal</h1><p className="text-gray-600 text-sm">Gestión de médicos y personal sanitario.</p></div>;
      case 'settings':
        return <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h1 className="text-xl font-semibold mb-2">Configuración</h1><p className="text-gray-600 text-sm">Preferencias de la aplicación.</p></div>;
      case 'overview':
      default:
        return <Resumen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MediCare+</span>
            </div>
            
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Dr. Usuario'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.department || 'Medicina General'}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </span>
              </div>
            </div>

            <button 
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;