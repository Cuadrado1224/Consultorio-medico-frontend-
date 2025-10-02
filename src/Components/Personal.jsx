import React, { useEffect, useState, useCallback } from 'react';
import { http } from '../service/httpClient';
import Swal from 'sweetalert2';
import { UserPlus, Search, Edit3, Trash2, Loader2, AlertTriangle, ClipboardList } from 'lucide-react';
import CrearUsuario from './ui/CrearUsuario';

/* Gestión de usuarios del sistema (vinculados a empleados)
 Endpoints (swagger):
  GET  /Administracion/Usuarios -> { usuarios: Usuario[] }
  POST /Administracion/Usuarios (UsuarioRegistro) { nombreUsuario, contrasenia, empleadoId }
  PUT  /Administracion/Usuarios/{id} (UsuarioActualizar) { id, nombreUsuario, contrasenia, empleadoId }
  DELETE /Administracion/Usuarios/{id}
  Para seleccionar empleado: GET /Administracion/Empleados
*/
const Personal = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  const normalizar = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [resUsu, resEmp] = await Promise.all([
        http.get('Administracion/Usuarios'),
        http.get('Administracion/Empleados')
      ]);
      setUsuarios(normalizar(resUsu.data, 'usuarios'));
      setEmpleados(normalizar(resEmp.data, 'empleados'));
    } catch (e) {
      console.error(e); setError('No se pudieron cargar los usuarios');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (payload) => {
    try {
      const { data } = await http.post('Administracion/Usuarios', payload);
      setUsuarios(prev => [...prev, data]);
      setShowModal(false); setUsuarioEdit(null);
      Swal.fire({ toast:true, position:'top-end', timer:1800, showConfirmButton:false, background:'#e8f5e9', color:'#2e7d32', icon:'success', title:'Usuario creado' });
    } catch (e) {
      Swal.fire({ toast:true, position:'top-end', timer:2500, showConfirmButton:false, background:'#ffebee', color:'#b71c1c', icon:'error', title: e.message || 'Error al crear usuario' });
    }
  };

  const handleUpdate = async (payload) => {
    try {
      // Si no se modificó contraseña, remover del payload (nullable)
      if (!payload.contrasenia) delete payload.contrasenia;
      const { data } = await http.put(`Administracion/Usuarios/${payload.id}`, payload);
      setUsuarios(prev => prev.map(u => u.id === data.id ? data : u));
      setShowModal(false); setUsuarioEdit(null);
      Swal.fire({ toast:true, position:'top-end', timer:1800, showConfirmButton:false, background:'#e8f5e9', color:'#2e7d32', icon:'success', title:'Usuario actualizado' });
    } catch (e) {
      Swal.fire({ toast:true, position:'top-end', timer:2500, showConfirmButton:false, background:'#ffebee', color:'#b71c1c', icon:'error', title: e.message || 'Error al actualizar usuario' });
    }
  };

  const handleDelete = async (id) => {
    try {
      const r = await Swal.fire({ title:'¿Eliminar usuario?', text:'Acción irreversible', icon:'warning', showCancelButton:true, confirmButtonText:'Eliminar', cancelButtonText:'Cancelar' });
      if (!r.isConfirmed) return;
      await http.delete(`Administracion/Usuarios/${id}`);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      Swal.fire({ toast:true, position:'top-end', timer:1600, showConfirmButton:false, background:'#e8f5e9', color:'#2e7d32', icon:'success', title:'Usuario eliminado' });
    } catch (e) {
      Swal.fire({ toast:true, position:'top-end', timer:2500, showConfirmButton:false, background:'#ffebee', color:'#b71c1c', icon:'error', title: e.message || 'Error al eliminar usuario' });
    }
  };

  const filtered = usuarios.filter(u => {
    const f = filter.toLowerCase().trim();
    if (!f) return true;
    return [u.nombreUsuario, u.empleado?.nombre].some(v => (v || '').toLowerCase().includes(f));
  });

  return (
    <div className="space-y-6">
      <CrearUsuario
        show={showModal}
        onClose={() => { setShowModal(false); setUsuarioEdit(null); }}
        onSubmit={usuarioEdit ? handleUpdate : handleCreate}
        initialData={usuarioEdit}
        empleados={empleados}
        usuarios={usuarios}
      />

      <div>
        <h1 className="text-4xl font-semibold text-gray-900">Usuarios</h1>
        <p className="mt-1 text-xl text-gray-600">Cuentas del sistema ligadas a empleados.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar usuario o empleado..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button
            className="bg-blue-600 text-white text-lg font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            onClick={() => { setShowModal(true); setUsuarioEdit(null); }}
          >
            <UserPlus className="w-5 h-5" /> Nuevo Usuario
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
                <th className="text-left px-4 py-3 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 font-medium">Empleado</th>
                <th className="text-left px-4 py-3 font-medium">Centro</th>
                <th className="text-left px-4 py-3 font-medium">Especialidad</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="px-3 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-7 h-7 text-red-500" />
                      <span className="text-red-600 font-medium">{error}</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="w-7 h-7 text-gray-400" />
                      <span className="text-gray-500">Sin resultados</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.nombreUsuario || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{u.empleado?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{u.empleado?.centroMedico?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{u.empleado?.especialidad?.especialidad_ || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{u.empleado?.tipoEmpleado?.tipo || '—'}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap flex items-center justify-end gap-3">
                    <button
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => { setUsuarioEdit(u); setShowModal(true); }}
                    >
                      <Edit3 className="w-4 h-4 mr-1" /> Editar
                    </button>
                    <button
                      className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                      onClick={() => handleDelete(u.id)}
                    >
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

export default Personal;
