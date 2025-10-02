import React, { useState, useEffect } from 'react';
import { http } from '../service/httpClient';
import { 
  Heart,Hospital, Users, Calendar, Activity, UserPlus, FileText, 
  Bell, Settings, LogOut, Stethoscope, Bed, Clock, TrendingUp, Loader2 
} from 'lucide-react';

const Resumen = () => {
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

    const [dashboardData, setDashboardData] = useState({
        stats: defaultStats,
        recentPatients: defaultPatients,
        recentActivity: defaultActivity,
        loading: true,
        error: null
      });

   useEffect(() => {
      const loadDashboardData = async () => {
        try {
          setDashboardData(prev => ({ ...prev, loading: true, error: null }));
  
          // Intentar cargar datos del backend
          const [statsData, patientsData, activityData] = await Promise.allSettled([
            http.get('Dashboard/Stats'),
            http.get('Dashboard/RecentPatients'),
            http.get('Dashboard/RecentActivity')
          ]);
  
          setDashboardData({
            stats: statsData.status === 'fulfilled' ? statsData.value.data : defaultStats,
            recentPatients: patientsData.status === 'fulfilled' ? patientsData.value.data : defaultPatients,
            recentActivity: activityData.status === 'fulfilled' ? activityData.value.data : defaultActivity,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Error cargando datos del dashboard:', error);
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

  if (dashboardData.loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Cargando resumen...</p>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
          {dashboardData.error}
        </div>
        {/* Mostrar igualmente contenido con datos por defecto */}
      </div>
    );
  }

  return (
          <>
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
          </>
        )
}

export default Resumen