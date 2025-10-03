import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, Clock, User, Stethoscope, Search, Plus, Filter,
  Eye, Edit2, Trash2, X, Save, AlertCircle, CheckCircle
} from 'lucide-react';
import { http } from '../service/httpClient';
import { tokenUtils } from '../utils/TokenUtils';
import { useAuth } from '../context/AuthContext';

const Citas = () => {
  const { user } = useAuth();
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
    fechaDesde: '',
    fechaHasta: '',
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
      if (!token) {
        return null;
      }
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Intentar múltiples variaciones de campos comunes
      const userData = {
        idEmpleado: payload.IdEmpleado || payload.empleadoId || payload.id || payload.sub,
        nombre: payload.unique_name || payload.name || payload.nombre || payload.usuario,
        especialidad: payload.Especialidad || payload.especialidad,
        tipoEmpleado: payload.TipoEmpleado || payload.tipoEmpleado || payload.role,
        tipoEmpleadoID: payload.TipoEmpleadoID || payload.tipoEmpleadoID || payload.TipoEmpleadoId || payload.tipoEmpleadoId,
        centroMedico: payload.CentroMedico || payload.centroMedico,
        idCentroMedico: payload.idCentroMedico || payload.IdCentroMedico || payload.centroMedicoId || payload.centroMedicoID
      };
      

      
      // Validar que tenemos los datos mínimos necesarios
      if (!userData.idEmpleado && !userData.nombre) {
        return null;
      }
      
      return userData;
    } catch {
      return null;
    }
  };

  // Cargar datos iniciales
  const cargarDatosIniciales = useCallback(async () => {
    try {
      setLoading(true);
      const userData = decodificarToken();
      
      if (!userData) {
        throw new Error('No se pudo obtener información del usuario logueado. Por favor, inicie sesión nuevamente.');
      }
      
      setEmpleadoActual(userData);
      
      try {
        const pacientesData = await http.getPacientes();
        
        let pacientesArray = [];
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(pacientesData)) {
          pacientesArray = pacientesData;
        } else if (pacientesData && Array.isArray(pacientesData.data)) {
          pacientesArray = pacientesData.data;
        } else if (pacientesData && Array.isArray(pacientesData.pacientes)) {
          pacientesArray = pacientesData.pacientes;
        } else {
          pacientesArray = [];
        }
        
        setPacientes(pacientesArray);
        
      } catch {
        setPacientes([]);
      }
      
    } catch (error) {
      setError('Error al cargar datos iniciales: ' + error.message);
      setPacientes([]);
    } finally {
      setLoading(false);
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
    observaciones: `Diagnóstico: ${consulta.diagnostico || 'N/A'}. Tratamiento: ${consulta.tratamiento || 'N/A'}`
  });

  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Aplicar filtro automático si el usuario no es administrador
      const userData = decodificarToken();
      let filtrosAplicados = { ...filtros };
      
      // Verificar si es administrador usando tipoEmpleadoID (1 = Administrador)
      const esAdministrador = userData?.tipoEmpleadoID === 1;
      
      if (userData && !esAdministrador) {
        filtrosAplicados.medicoId = userData.idEmpleado;
      }
      
      const response = await http.getCitas(filtrosAplicados);
      
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
        consultasArray = [];
      }
      
      const consultasMapeadas = consultasArray.map(mapearConsulta);
      setCitas(consultasMapeadas);
      setError(null);
    } catch (err) {
      if (err.message.includes('timeout')) {
        setError('Timeout: El servidor está tardando demasiado en responder. Intenta nuevamente.');
      } else if (err.message.includes('NETWORK_ERROR')) {
        setError('Error de conectividad: No se puede conectar con el servidor.');
      } else {
        setError('Error al cargar las citas: ' + err.message);
      }
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  useEffect(() => {
    if (empleadoActual) {
      cargarCitas();
    }
  }, [cargarCitas, empleadoActual]);



  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
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
      
      // Validar datos antes de enviar
      console.log('Form data original:', formData); // Debug
      console.log('Empleado actual:', empleadoActual); // Debug
      
      if (!formData.centroMedicoId) {
        throw new Error('No se puede determinar el centro médico. Por favor, inicie sesión nuevamente.');
      }
      
      // Encontrar la cédula del paciente seleccionado
      const pacienteSeleccionado = pacientes.find(p => p.idPaciente === parseInt(formData.pacienteId));
      
      if (!pacienteSeleccionado) {
        throw new Error('No se puede encontrar el paciente seleccionado.');
      }
      
      // Mapear los datos al formato esperado por el backend
      const datosParaBackend = {
        fecha: formData.fecha,
        hora: formData.hora,
        motivo: formData.motivo,
        diagnostico: formData.diagnostico || '',
        tratamiento: formData.tratamiento || '',
        idMedico: parseInt(empleadoActual?.idEmpleado) || 0,
        cedula: pacienteSeleccionado.cedula,
        idCentroMedico: parseInt(formData.centroMedicoId) || 0
      };
      
      console.log('Datos mapeados para backend:', datosParaBackend); // Debug
      
      if (modalMode === 'create') {
        await http.createConsulta(datosParaBackend);
      } else if (modalMode === 'edit') {
        // Para editar, incluir el ID de la consulta
        const datosParaEditar = {
          ...datosParaBackend,
          idConsultaMedica: selectedCita.id
        };
        await http.updateConsulta(selectedCita.id, datosParaEditar);
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
      
      // Encontrar el paciente completo para el objeto de eliminación
      const pacienteCompleto = pacientes.find(p => p.idPaciente === parseInt(citaToDelete.pacienteId));
      
      // Construir el objeto completo que espera el backend para eliminar
      const consultaParaEliminar = {
        idConsultaMedica: citaToDelete.id,
        fecha: citaToDelete.fecha,
        hora: citaToDelete.hora,
        motivo: citaToDelete.motivo,
        diagnostico: citaToDelete.diagnostico || '',
        tratamiento: citaToDelete.tratamiento || '',
        idMedico: parseInt(empleadoActual?.idEmpleado) || 0,
        cedula: pacienteCompleto?.cedula || citaToDelete.pacienteCedula,
        idCentroMedico: parseInt(empleadoActual?.idCentroMedico) || 0
      };
      
      console.log('Eliminando consulta con objeto completo:', consultaParaEliminar); // Debug
      
      await http.deleteCita(citaToDelete.id, consultaParaEliminar);
      await cargarCitas();
      setShowDeleteConfirm(false);
      setCitaToDelete(null);
    } catch (err) {
      setError('Error al eliminar la cita: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };



  // Optimización con useMemo para evitar recalcular filtros innecesariamente
  const citasFiltradas = useMemo(() => citas.filter(cita => {
    // Filtro por rango de fechas (comparación de strings de fecha en formato YYYY-MM-DD)
    if (filtros.fechaDesde && cita.fecha && cita.fecha < filtros.fechaDesde) return false;
    if (filtros.fechaHasta && cita.fecha && cita.fecha > filtros.fechaHasta) return false;
    
    // Filtro por médico ID
    if (filtros.medicoId && filtros.medicoId.trim() !== '') {
      const medicoIdFiltro = filtros.medicoId.toLowerCase();
      const medicoMatch = 
        cita.medicoId?.toString().toLowerCase().includes(medicoIdFiltro) ||
        cita.medicoNombre?.toLowerCase().includes(medicoIdFiltro);
      if (!medicoMatch) return false;
    }
    
    // Filtro por paciente ID (si se agrega en el futuro)
    if (filtros.pacienteId && filtros.pacienteId.trim() !== '') {
      const pacienteIdFiltro = filtros.pacienteId.toLowerCase();
      const pacienteMatch =
        cita.pacienteId?.toString().toLowerCase().includes(pacienteIdFiltro) ||
        cita.pacienteNombre?.toLowerCase().includes(pacienteIdFiltro) ||
        cita.pacienteCedula?.toLowerCase().includes(pacienteIdFiltro);
      if (!pacienteMatch) return false;
    }
    
    // Filtro por búsqueda de texto general
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      const busqueda = filtros.busqueda.toLowerCase();
      const textoMatch = (
        cita.pacienteNombre?.toLowerCase().includes(busqueda) ||
        cita.pacienteCedula?.toLowerCase().includes(busqueda) ||
        cita.especialidad?.toLowerCase().includes(busqueda) ||
        cita.motivo?.toLowerCase().includes(busqueda) ||
        cita.medicoNombre?.toLowerCase().includes(busqueda) ||
        cita.diagnostico?.toLowerCase().includes(busqueda) ||
        cita.tratamiento?.toLowerCase().includes(busqueda)
      );
      if (!textoMatch) return false;
    }
    
    return true;
  }), [citas, filtros]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600">
            {empleadoActual && empleadoActual.tipoEmpleadoID === 1
              ? "👑 Administra todas las citas médicas del consultorio" 
              : `🩺 Consultas médicas de ${empleadoActual?.nombre || user?.name || 'tu cuenta'}`}
          </p>
          {empleadoActual && (
            <p className="text-sm text-gray-500 mt-1">
              Tipo de empleado: {empleadoActual.tipoEmpleadoID === 1 ? 'Administrador' : 'Empleado'}
            </p>
          )}
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          {empleadoActual && empleadoActual.tipoEmpleadoID !== 1 && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
             
            </div>
          )}
        </div>
        
                <div className={`grid grid-cols-1 gap-3 ${empleadoActual && empleadoActual.tipoEmpleadoID === 1 ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Solo mostrar filtro por médico si es administrador */}
          {empleadoActual && empleadoActual.tipoEmpleadoID === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
              <input
                type="text"
                placeholder="Nombre o ID"
                value={filtros.medicoId}
                onChange={(e) => handleFiltroChange('medicoId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
            <input
              type="text"
              placeholder="Nombre o cédula"
              value={filtros.pacienteId}
              onChange={(e) => handleFiltroChange('pacienteId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Diagnóstico, motivo..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-medium">Error de Conexión</span>
          </div>
          <p className="text-red-700 mb-3">{error}</p>
          <button
            onClick={() => cargarCitas()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de Citas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">
              {empleadoActual && empleadoActual.tipoEmpleadoID === 1 
                ? 'Cargando todas las consultas...' 
                : 'Cargando tus consultas...'}
            </p>
            <p className="text-gray-500 text-sm mt-2">Timeout extendido a 30 segundos</p>
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
                            {cita.pacienteCedula}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Nueva Cita' : 
                   modalMode === 'edit' ? 'Editar Cita' : 'Detalles de la Cita'}
                </h3>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleFormChange('fecha', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleFormChange('hora', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Paciente *
                  </label>
                  <select
                    value={formData.pacienteId}
                    onChange={(e) => handleFormChange('pacienteId', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {pacientes.length === 0 ? 'Cargando pacientes...' : 'Seleccionar paciente'}
                    </option>
                    {pacientes.length === 0 ? (
                      <option disabled>No hay pacientes disponibles</option>
                    ) : (
                      pacientes.map((paciente) => (
                        <option key={paciente.idPaciente} value={paciente.idPaciente}>
                          {paciente.cedula} - {paciente.nombre}
                        </option>
                      ))
                    )}
                  </select>
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-1">
                    Debug: {pacientes.length} pacientes disponibles (todos los centros médicos)
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Médico
                  </label>
                  <input
                    type="text"
                    value={empleadoActual?.nombre || 'Cargando...'}
                    disabled={true}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    placeholder="Médico asignado"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    value={empleadoActual?.especialidad || 'Cargando...'}
                    disabled={true}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    placeholder="Especialidad del médico"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Centro Médico
                </label>
                <input
                  type="text"
                  value={empleadoActual?.centroMedico || 'Cargando...'}
                  disabled={true}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  placeholder="Centro médico"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Motivo de la Consulta *
                </label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => handleFormChange('motivo', e.target.value)}
                  disabled={modalMode === 'view'}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Describa el motivo de la consulta"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnostico}
                  onChange={(e) => handleFormChange('diagnostico', e.target.value)}
                  disabled={modalMode === 'view'}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Diagnóstico médico"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Tratamiento
                </label>
                <textarea
                  value={formData.tratamiento}
                  onChange={(e) => handleFormChange('tratamiento', e.target.value)}
                  disabled={modalMode === 'view'}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Tratamiento recomendado"
                />
              </div>


            </div>

            {modalMode !== 'view' && (
              <div className="flex gap-3 mt-6 p-6 border-t border-gray-200">
                <button
                  onClick={cerrarModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCita}
                  disabled={submitting || !formData.fecha || !formData.hora || !formData.pacienteId || !formData.motivo}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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