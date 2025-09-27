import React, { useState, useEffect } from 'react';
import { 
  Heart, Users, Calendar, Activity, UserPlus, FileText, 
  Bell, Settings, LogOut, Stethoscope, Bed, Clock, TrendingUp, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../service/apiService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentPatients: [],
    recentActivity: [],
    loading: true,
    error: null
  });

  // Datos por defecto para cuando no hay conexión
  const defaultStats = [
    {
      title: 'Pacientes Hoy',
      value: '156',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Citas Programadas',
      value: '89',
      change: '+5%',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Emergencias',
      value: '23',
      change: '-8%',
      icon: Activity,
      color: 'bg-red-500'
    },
    {
      title: 'Camas Disponibles',
      value: '45',
      change: '0%',
      icon: Bed,
      color: 'bg-purple-500'
    }
  ];

  const defaultPatients = [
    { name: 'María González', id: '001234', status: 'En consulta', time: '10:30 AM' },
    { name: 'Carlos Rodríguez', id: '001235', status: 'Esperando', time: '11:00 AM' },
    { name: 'Ana López', id: '001236', status: 'Completado', time: '11:30 AM' },
    { name: 'Luis Martínez', id: '001237', status: 'En consulta', time: '12:00 PM' }
  ];

  const defaultActivity = [
    { action: 'Nueva cita programada', patient: 'Elena Vargas', time: '2 min ago', type: 'appointment' },
    { action: 'Historial actualizado', patient: 'Miguel Torres', time: '15 min ago', type: 'record' },
    { action: 'Alta médica', patient: 'Sofia Jiménez', time: '1 hora ago', type: 'discharge' },
    { action: 'Ingreso de emergencia', patient: 'Roberto Silva', time: '2 horas ago', type: 'emergency' }
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));

        // Intentar cargar datos del backend
        const [statsData, patientsData, activityData] = await Promise.allSettled([
          apiService.getDashboardStats(),
          apiService.getRecentPatients(),
          apiService.getRecentActivity()
        ]);

        setDashboardData({
          stats: statsData.status === 'fulfilled' ? statsData.value : defaultStats,
          recentPatients: patientsData.status === 'fulfilled' ? patientsData.value : defaultPatients,
          recentActivity: activityData.status === 'fulfilled' ? activityData.value : defaultActivity,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        // Usar datos por defecto si hay error
        setDashboardData({
          stats: defaultStats,
          recentPatients: defaultPatients,
          recentActivity: defaultActivity,
          loading: false,
          error: 'Error de conexión - Mostrando datos de ejemplo'
        });
      }
    };

    loadDashboardData();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: Activity },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'medical-records', label: 'Historiales', icon: FileText },
    { id: 'staff', label: 'Personal', icon: Stethoscope },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

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
            {dashboardData.error && (
              <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
                Modo offline
              </div>
            )}
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData.stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-2 flex items-center ${
                      stat.change.startsWith('+') ? 'text-green-600' : 
                      stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change} vs. ayer
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Patients */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Pacientes Recientes</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver todos
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.recentPatients.map((patient, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">ID: {patient.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          patient.status === 'En consulta' ? 'bg-blue-100 text-blue-800' :
                          patient.status === 'Esperando' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {patient.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{patient.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-colors">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Registrar Paciente</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-colors">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Nueva Cita</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-colors">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Ver Historial</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors">
                  <Activity className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Emergencia</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'appointment' ? 'bg-blue-500' :
                      activity.type === 'record' ? 'bg-green-500' :
                      activity.type === 'discharge' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.patient}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;