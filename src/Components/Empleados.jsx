import React, { useEffect, useState, useCallback } from 'react';
import { http } from '../service/httpClient';
import Swal from 'sweetalert2';
import { UserPlus, Search, Edit3, Trash2, Loader2, AlertTriangle, ClipboardList } from 'lucide-react';
import CrearEmpleado from './ui/CrearEmpleado';
import CrearEspecialidad from './ui/CrearEspecialidad';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [centros, setCentros] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [showModalEmpleado, setShowModalEmpleado] = useState(false);
  const [showModalEspecialidad, setShowModalEspecialidad] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState(null);

  const normalizarLista = (data, prop) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[prop])) return data[prop];
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [resEmp, resCent, resTip, resEsp] = await Promise.all([
        http.get('Administracion/Empleados'),
        http.get('Administracion/CentrosMedicos'),
        http.get('Administracion/TiposEmpleados'),
        http.get('Administracion/Especialidades')
      ]);
      setEmpleados(normalizarLista(resEmp.data, 'empleados'));
      setCentros(normalizarLista(resCent.data, 'centros'));
      setTipos(normalizarLista(resTip.data, 'tipos'));
      setEspecialidades(normalizarLista(resEsp.data, 'especialidades'));
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleCrearEspecialidad = async (form) => {
    try {
      const { data } = await http.post('Administracion/Especialidades', form);
      setEspecialidades(prev => [...prev, data]);
      setShowModalEspecialidad(false);
      Swal.fire({
        toast: true, position: 'top-end', timer: 2000, showConfirmButton: false,
        background: '#e8f5e9', color: '#2e7d32', icon: 'success', title: 'Especialidad creada'
      });
    } catch (e) {
      Swal.fire({ toast: true, position: 'top-end', timer: 2500, showConfirmButton: false, background: '#ffebee', color: '#b71c1c', icon: 'error', title: e.message || 'Error al crear especialidad' });
    }
  };

  const handleAddEmpleado = async (nuevo) => {
    try {
      const { data } = await http.post('Administracion/Empleados', {
        centroMedicoID: nuevo.centroMedicoID,
        tipoEmpleadoID: nuevo.tipoEmpleadoID,
        nombre: nuevo.nombre,
        cedula: nuevo.cedula,
        especialidadID: nuevo.especialidadID,
        telefono: nuevo.telefono,
        email: nuevo.email,
        salario: nuevo.salario
      });
      setEmpleados(prev => [...prev, data]);
      setShowModalEmpleado(false);
      setEmpleadoEdit(null);
      Swal.fire({ toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#e8f5e9', color: '#2e7d32', icon: 'success', title: 'Empleado creado' });
    } catch (e) {
      Swal.fire({ toast: true, position: 'top-end', timer: 2500, showConfirmButton: false, background: '#ffebee', color: '#b71c1c', icon: 'error', title: e.message || 'Error al crear empleado' });
    }
  };

  const handleUpdateEmpleado = async (emp) => {
    try {
      const { data } = await http.put(`Administracion/Empleados/${emp.id}`, {
        id: emp.id,
        centroMedicoID: emp.centroMedicoID,
        tipoEmpleadoID: emp.tipoEmpleadoID,
        nombre: emp.nombre,
        cedula: emp.cedula,
        especialidadID: emp.especialidadID,
        telefono: emp.telefono,
        email: emp.email,
        salario: emp.salario
      });
      setEmpleados(prev => prev.map(e => e.id === data.id ? data : e));
      setShowModalEmpleado(false);
      setEmpleadoEdit(null);
      Swal.fire({ toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#e8f5e9', color: '#2e7d32', icon: 'success', title: 'Empleado actualizado' });
    } catch (e) {
      Swal.fire({ toast: true, position: 'top-end', timer: 2500, showConfirmButton: false, background: '#ffebee', color: '#b71c1c', icon: 'error', title: e.message || 'Error al actualizar empleado' });
    }
  };

  const handleDeleteEmpleado = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar empleado?', text: 'Esta acción no se puede deshacer.', icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
      });
      if (!result.isConfirmed) return;
      await http.delete(`Administracion/Empleados/${id}`);
      setEmpleados(prev => prev.filter(e => e.id !== id));
      Swal.fire({ toast: true, position: 'top-end', timer: 1800, showConfirmButton: false, background: '#e8f5e9', color: '#2e7d32', icon: 'success', title: 'Empleado eliminado' });
    } catch (e) {
      Swal.fire({ toast: true, position: 'top-end', timer: 2500, showConfirmButton: false, background: '#ffebee', color: '#b71c1c', icon: 'error', title: e.message || 'Error al eliminar empleado' });
    }
  };

  const filtered = empleados.filter(emp => {
    const f = filter.toLowerCase().trim();
    if (!f) return true;
    return [emp.nombre, emp.cedula, emp.email].some(v => (v || '').toLowerCase().includes(f));
  });

  return (
    <div className="space-y-6">
      <CrearEmpleado
        show={showModalEmpleado}
        onClose={() => { setShowModalEmpleado(false); setEmpleadoEdit(null); }}
        onSubmit={empleadoEdit ? handleUpdateEmpleado : handleAddEmpleado}
        initialData={empleadoEdit}
        centros={centros}
        tipos={tipos}
        especialidades={especialidades}
        onNuevaEspecialidad={() => setShowModalEspecialidad(true)}
      />
      <CrearEspecialidad
        show={showModalEspecialidad}
        onClose={() => setShowModalEspecialidad(false)}
        onSubmit={handleCrearEspecialidad}
      />

      <div>
        <h1 className="text-4xl font-semibold text-gray-900">Empleados</h1>
        <p className="mt-1 text-xl text-gray-600">Gestión de médicos y personal registrado.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o email ..."
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
        </div>
        <div className="flex gap-4">
          <button
            className="bg-blue-600 text-white text-lg font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={() => { setShowModalEmpleado(true); setEmpleadoEdit(null); }}
          >
            <UserPlus className="w-5 h-5" /> Nuevo Empleado
          </button>
          <button
            onClick={() => setFilter('')}
            className="text-lg px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 text-sm uppercase text-gray-600 tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Cédula</th>
                <th className="text-left px-4 py-3 font-medium">Centro</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Especialidad</th>
                <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Salario</th>
                <th className="px-3 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Cargando empleados...</span>
                    </div>
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-red-600">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-7 h-7 text-red-500" />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="w-7 h-7 text-gray-400" />
                      <span>No hay resultados</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{emp.nombre || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.cedula || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.centroMedico?.nombre || centros.find(c=>c.id===emp.centroMedicoID)?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.tipoEmpleado?.tipo || tipos.find(t=>t.id===emp.tipoEmpleadoID)?.tipo || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.especialidad?.especialidad_ || emp.especialidad?.especialidad || especialidades.find(e=>e.id===emp.especialidadID)?.especialidad_ || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.telefono || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{emp.salario != null ? `$${emp.salario}` : '—'}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap flex items-center justify-end gap-3">
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={() => { setEmpleadoEdit(emp); setShowModalEmpleado(true); }}>
                      <Edit3 className="w-4 h-4 mr-1" /> Editar
                    </button>
                    <button className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium" onClick={() => handleDeleteEmpleado(emp.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Empleados;
