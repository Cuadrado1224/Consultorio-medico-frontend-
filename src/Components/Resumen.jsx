import React, { useState, useEffect } from 'react';
import { http } from '../service/httpClient';
import {
  Users, Calendar, Activity, Building2, UserCog, Stethoscope,
  AlertCircle, CheckCircle
} from 'lucide-react';

const Resumen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    centrosMedicos: [],
    empleados: [],
    usuarios: [],
    consultas: [],
    pacientes: [],
    especialidades: []
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        centrosMedicosRes,
        empleadosRes,
        usuariosRes,
        consultasRes,
        pacientesRes,
        especialidadesRes
      ] = await Promise.allSettled([
        http.get('/Administracion/CentrosMedicos'),
        http.get('/Administracion/Empleados'),
        http.get('/Administracion/Usuarios'),
        http.get('/CentroMedico/Consultas'),
        http.get('/CentroMedico/Pacientes'),
        http.get('/Administracion/Especialidades')
      ]);

      setData({
        centrosMedicos: centrosMedicosRes.status === 'fulfilled' ? centrosMedicosRes.value.data.centros || [] : [],
        empleados: empleadosRes.status === 'fulfilled' ? empleadosRes.value.data.empleados || [] : [],
        usuarios: usuariosRes.status === 'fulfilled' ? usuariosRes.value.data.usuarios || [] : [],
        consultas: consultasRes.status === 'fulfilled' ? consultasRes.value.data.consultas || [] : [],
        pacientes: pacientesRes.status === 'fulfilled' ? pacientesRes.value.data.pacientes || [] : [],
        especialidades: especialidadesRes.status === 'fulfilled' ? especialidadesRes.value.data.especialidades || [] : []
      });

    } catch (err) {
      console.error('Error cargando datos del resumen:', err);
      setError('Error al cargar los datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const getConsultasHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return data.consultas.filter(c => c.fecha?.startsWith(hoy)).length;
  };

  const getEmpleadosPorTipo = () => {
    const porTipo = {};
    data.empleados.forEach(emp => {
      const tipo = emp.tipoEmpleado?.tipo || 'Sin tipo';
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });
    return porTipo;
  };

  const getCentroConMasEmpleados = () => {
    const porCentro = {};
    data.empleados.forEach(emp => {
      const centro = emp.centroMedico?.nombre || 'Sin asignar';
      porCentro[centro] = (porCentro[centro] || 0) + 1;
    });
    const entries = Object.entries(porCentro);
    return entries.length > 0 ? entries.sort((a, b) => b[1] - a[1])[0] : ['N/A', 0];
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando resumen del sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg flex items-center text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Centros',
      value: data.centrosMedicos.length,
      icon: Building2,
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Empleados',
      value: data.empleados.length,
      icon: UserCog,
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Pacientes',
      value: data.pacientes.length,
      icon: Users,
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Consultas',
      value: data.consultas.length,
      icon: Calendar,
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Hoy',
      value: getConsultasHoy(),
      icon: Activity,
      bgLight: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Usuarios',
      value: data.usuarios.length,
      icon: CheckCircle,
      bgLight: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    {
      title: 'Especialidades',
      value: data.especialidades.length,
      icon: Stethoscope,
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  const empleadosPorTipo = getEmpleadosPorTipo();
  const [centroTop, cantidadEmpleados] = getCentroConMasEmpleados();

  return (
    <div className="h-screen overflow-hidden bg-gray-50 p-4">
      <div className="h-full flex flex-col">
        {/* Header compacto */}
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-900">Resumen General del Sistema</h1>
          <p className="text-gray-600 text-xs">Vista rápida de todos los datos del consultorio médico</p>
        </div>

        {/* Stats Cards - Ahora 7 tarjetas */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center">
                <div className={`${stat.bgLight} p-2 rounded-lg mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                </div>
                <p className="text-xs font-medium text-gray-500 text-center mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contenido principal en 3 columnas */}
        <div className="flex-1 grid grid-cols-3 gap-3 overflow-hidden">
          {/* Columna 1 */}
          <div className="flex flex-col gap-3">
            {/* Centros Médicos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                  Centros Médicos
                </h2>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                {data.centrosMedicos.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-2">No hay centros médicos</p>
                ) : (
                  <div className="space-y-2">
                    {data.centrosMedicos.map((centro) => (
                      <div key={centro.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colores">
                        <h3 className="font-semibold text-gray-900 text-xs">{centro.nombre}</h3>
                        <p className="text-xs text-gray-600">{centro.ciudad}</p>
                        <p className="text-xs text-gray-500 truncate">{centro.direccion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Especialidades */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2 text-indigo-600" />
                  Especialidades
                </h2>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                {data.especialidades.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-2">No hay especialidades</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1">
                    {data.especialidades.map((esp) => (
                      <div key={esp.id} className="p-1.5 bg-indigo-50 rounded text-center">
                        <span className="text-xs font-medium text-indigo-900 block truncate">{esp.especialidad_}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna 2 */}
          <div className="flex flex-col gap-3">
            {/* Empleados por Tipo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <UserCog className="w-4 h-4 mr-2 text-green-600" />
                  Empleados por Tipo
                </h2>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                {Object.keys(empleadosPorTipo).length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-2">No hay empleados</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(empleadosPorTipo).map(([tipo, cantidad]) => (
                      <div key={tipo} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs font-medium text-gray-700">{tipo}</span>
                        <span className="text-xs font-bold text-gray-900 bg-green-100 px-2 py-1 rounded-full">
                          {cantidad}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs">
                        <span className="text-gray-700 font-medium">Centro principal: </span>
                        <span className="text-green-600 font-bold">{centroTop} ({cantidadEmpleados})</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Últimas Consultas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                  Últimas Consultas
                </h2>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                {data.consultas.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-2">No hay consultas</p>
                ) : (
                  <div className="space-y-2">
                    {data.consultas.slice(0, 5).map((consulta) => (
                      <div key={consulta.idConsultaMedica} className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colores">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-900 truncate flex-1">
                            {consulta.paciente?.nombre || 'Paciente no especificado'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">{consulta.fecha}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <p className="truncate"><strong>Médico:</strong> {consulta.empleado?.nombre || 'N/A'}</p>
                          <p className="truncate"><strong>Motivo:</strong> {consulta.motivo || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna 3 */}
          <div className="flex flex-col gap-3">
            {/* Usuarios del Sistema */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-teal-600" />
                  Usuarios del Sistema
                </h2>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                {data.usuarios.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-2">No hay usuarios</p>
                ) : (
                  <div className="space-y-2">
                    {data.usuarios.map((usuario) => (
                      <div key={usuario.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colores">
                        <h3 className="font-semibold text-gray-900 text-xs">{usuario.nombreUsuario}</h3>
                        <p className="text-xs text-gray-600 truncate">
                          {usuario.empleado?.nombre || 'No asignado'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pacientes Recientes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  Pacientes Recientes
                </h2>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                {data.pacientes.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-2">No hay pacientes</p>
                ) : (
                  <div className="space-y-2">
                    {data.pacientes.slice(0, 5).map((paciente) => (
                      <div key={paciente.idPaciente} className="p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colores">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-xs truncate">{paciente.nombre}</h3>
                            <p className="text-xs text-gray-600">Cédula: {paciente.cedula}</p>
                            <p className="text-xs text-gray-500">Tel: {paciente.telefono}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resumen;
