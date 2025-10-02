import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, User, Stethoscope, Search, Plus, Filter,
  Eye, Edit2, Trash2, X, Save, AlertCircle, CheckCircle
} from 'lucide-react';
import { apiService } from '../service/apiService';
import { tokenUtils } from '../utils/TokenUtils';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [empleadoActual, setEmpleadoActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedCita, setSelectedCita] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    fecha: '',
    estado: '',
    medicoId: '',
    pacienteId: '',
    busqueda: ''
  });

  // Estados para el formulario
  const [formData, setFormData] = useState({
    idConsultaMedica: null,
    fecha: '',
    hora: '',
    motivo: '',
    diagnostico: '',
    tratamiento: '',
    pacienteId: '',
    empleadoId: '',
    centroMedicoId: ''
  });

  // Estados de carga
  const [submitting, setSubmitting] = useState(false);

  // Función para decodificar JWT y obtener datos del usuario
  const decodificarToken = () => {
    try {
      const token = tokenUtils.get();
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        idEmpleado: payload.IdEmpleado,
        nombre: payload.unique_name,
        especialidad: payload.Especialidad,
        tipoEmpleado: payload.TipoEmpleado,
        centroMedico: payload.CentroMedico,
        idCentroMedico: payload.idCentroMedico
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  };

  // Cargar datos iniciales
  const cargarDatosIniciales = useCallback(async () => {
    try {
      const [pacientesData, userData] = await Promise.all([
        apiService.getPacientes(),
        Promise.resolve(decodificarToken())
      ]);
      
      setPacientes(Array.isArray(pacientesData) ? pacientesData : []);
      setEmpleadoActual(userData);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  }, []);

  // Función para mapear los datos del backend al formato del frontend
  const mapearConsulta = (consulta) => ({
    id: consulta.idConsultaMedica,
    fecha: consulta.fecha,
    hora: consulta.hora,
    pacienteId: consulta.paciente?.idPaciente || '',
    pacienteNombre: consulta.paciente?.nombre || 'N/A',
    pacienteTelefono: consulta.paciente?.telefono || 'N/A',
    pacienteCedula: consulta.paciente?.cedula || 'N/A',
    medicoId: consulta.empleado?.id || '',
    medicoNombre: consulta.empleado?.nombre || 'N/A',
    especialidad: consulta.empleado?.especialidad?.especialidad_ || 'N/A',
    tipoEmpleado: consulta.empleado?.tipoEmpleado?.tipo || 'N/A',
    motivo: consulta.motivo || '',
    diagnostico: consulta.diagnostico || '',
    tratamiento: consulta.tratamiento || '',
    centroMedico: consulta.centroMedico?.nombre || 'N/A',
    estado: 'Completada', // Las consultas ya realizadas están completadas
    observaciones: `Diagnóstico: ${consulta.diagnostico || 'N/A'}. Tratamiento: ${consulta.tratamiento || 'N/A'}`
  });

  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCitas(filtros);
      
      // Verificar si la respuesta es un array o tiene estructura anidada
      let consultasArray = [];
      if (Array.isArray(response)) {
        consultasArray = response;
      } else if (response && Array.isArray(response.data)) {
        consultasArray = response.data;
      } else if (response && Array.isArray(response.items)) {
        consultasArray = response.items;
      } else if (response && Array.isArray(response.consultas)) {
        consultasArray = response.consultas;
      } else {
        console.log('Estructura de respuesta no reconocida:', response);
        consultasArray = [];
      }
      
      const consultasMapeadas = consultasArray.map(mapearConsulta);
      setCitas(consultasMapeadas);
      setError(null);
    } catch (err) {
      setError('Error al cargar las citas: ' + err.message);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarDatosIniciales();
    cargarCitas();
  }, [cargarDatosIniciales, cargarCitas]);

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: '',
      estado: '',
      medicoId: '',
      pacienteId: '',
      busqueda: ''
    });
  };

  const abrirModal = (modo, cita = null) => {
    setModalMode(modo);
    if (cita) {
      setSelectedCita(cita);
      setFormData({
        idConsultaMedica: cita.id,
        fecha: cita.fecha || '',
        hora: cita.hora || '',
        motivo: cita.motivo || '',
        diagnostico: cita.diagnostico || '',
        tratamiento: cita.tratamiento || '',
        pacienteId: cita.pacienteId || '',
        empleadoId: cita.medicoId || empleadoActual?.idEmpleado || '',
        centroMedicoId: empleadoActual?.idCentroMedico || ''
      });
    } else {
      setSelectedCita(null);
      setFormData({
        idConsultaMedica: null,
        fecha: '',
        hora: '',
        motivo: '',
        diagnostico: '',
        tratamiento: '',
        pacienteId: '',
        empleadoId: empleadoActual?.idEmpleado || '',
        centroMedicoId: empleadoActual?.idCentroMedico || ''
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedCita(null);
    setFormData({
      idConsultaMedica: null,
      fecha: '',
      hora: '',
      motivo: '',
      diagnostico: '',
      tratamiento: '',
      pacienteId: '',
      empleadoId: empleadoActual?.idEmpleado || '',
      centroMedicoId: empleadoActual?.idCentroMedico || ''
    });
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const guardarCita = async () => {
    try {
      setSubmitting(true);
      
      if (modalMode === 'create') {
        await apiService.createCita(formData);
      } else if (modalMode === 'edit') {
        // El formData ya incluye el idConsultaMedica correcto
        await apiService.updateCita(selectedCita.id, formData);
      }
      
      await cargarCitas();
      cerrarModal();
    } catch (err) {
      setError('Error al guardar la cita: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmarEliminar = (cita) => {
    setCitaToDelete(cita);
    setShowDeleteConfirm(true);
  };

  const eliminarCita = async () => {
    try {
      setSubmitting(true);
      await apiService.deleteCita(citaToDelete.id);
      await cargarCitas();
      setShowDeleteConfirm(false);
      setCitaToDelete(null);
    } catch (err) {
      setError('Error al eliminar la cita: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Programada': return 'bg-blue-100 text-blue-800';
      case 'Confirmada': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      case 'Completada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const citasFiltradas = citas.filter(cita => {
    if (!filtros.busqueda) return true;
    const busqueda = filtros.busqueda.toLowerCase();
    return (
      cita.pacienteNombre?.toLowerCase().includes(busqueda) ||
      cita.especialidad?.toLowerCase().includes(busqueda) ||
      cita.motivo?.toLowerCase().includes(busqueda) ||
      cita.medicoNombre?.toLowerCase().includes(busqueda) ||
      cita.diagnostico?.toLowerCase().includes(busqueda) ||
      cita.tratamiento?.toLowerCase().includes(busqueda)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600">Administra las citas médicas del consultorio</p>
        </div>
        <button 
          onClick={() => abrirModal('create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cita</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) => handleFiltroChange('fecha', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="Completada">Completada</option>
              <option value="Programada">Programada</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
            <input
              type="text"
              placeholder="ID del médico"
              value={filtros.medicoId}
              onChange={(e) => handleFiltroChange('medicoId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Paciente, médico, diagnóstico..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Lista de Citas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando citas...</p>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay citas disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Médico/Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo/Diagnóstico
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {citasFiltradas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cita.fecha}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {cita.hora}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cita.pacienteNombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cita.pacienteTelefono}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cita.medicoNombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cita.especialidad}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="font-medium truncate">{cita.motivo}</div>
                        <div className="text-gray-500 truncate">{cita.diagnostico}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => abrirModal('view', cita)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModal('edit', cita)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmarEliminar(cita)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear/Editar/Ver Cita */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Nueva Cita' : 
                   modalMode === 'edit' ? 'Editar Cita' : 'Detalles de la Cita'}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleFormChange('fecha', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleFormChange('hora', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente *
                  </label>
                  <select
                    value={formData.pacienteId}
                    onChange={(e) => handleFormChange('pacienteId', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.idPaciente} value={paciente.idPaciente}>
                        {paciente.cedula} - {paciente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Médico
                  </label>
                  <input
                    type="text"
                    value={empleadoActual?.nombre || 'Cargando...'}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    placeholder="Médico asignado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    value={empleadoActual?.especialidad || 'Cargando...'}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    placeholder="Especialidad del médico"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centro Médico
                </label>
                <input
                  type="text"
                  value={empleadoActual?.centroMedico || 'Cargando...'}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  placeholder="Centro médico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de la Consulta *
                </label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => handleFormChange('motivo', e.target.value)}
                  disabled={modalMode === 'view'}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Describa el motivo de la consulta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnostico}
                  onChange={(e) => handleFormChange('diagnostico', e.target.value)}
                  disabled={modalMode === 'view'}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Diagnóstico médico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tratamiento
                </label>
                <textarea
                  value={formData.tratamiento}
                  onChange={(e) => handleFormChange('tratamiento', e.target.value)}
                  disabled={modalMode === 'view'}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Tratamiento recomendado"
                />
              </div>


            </div>

            {modalMode !== 'view' && (
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCita}
                  disabled={submitting || !formData.fecha || !formData.hora || !formData.pacienteId || !formData.motivo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ¿Está seguro que desea eliminar la cita de {citaToDelete?.pacienteNombre}? 
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCitaToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarCita}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Citas;