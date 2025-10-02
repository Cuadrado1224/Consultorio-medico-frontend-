import React, { useEffect, useState, useMemo } from 'react';
import { X, UserCog } from 'lucide-react';

/* Modal para crear / editar usuario
 Props:
  show, onClose, onSubmit(userPayload), initialData (usuario existente o null)
  empleados: lista de empleados [{id, nombre,...}]
  usuarios: lista de usuarios existentes (para filtrar empleados ya asignados)
*/
const CrearUsuario = ({ show, onClose, onSubmit, initialData, empleados, usuarios }) => {
  const [form, setForm] = useState({ nombreUsuario: '', contrasenia: '', empleadoId: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setForm(initialData ? {
        id: initialData.id,
        nombreUsuario: initialData.nombreUsuario || '',
        contrasenia: '', // no mostrar password existente
        empleadoId: initialData.empleadoId || initialData.empleado?.id || ''
      } : { nombreUsuario: '', contrasenia: '', empleadoId: '' });
      setErrors({});
    }
  }, [show, initialData]);

  const empleadosDisponibles = useMemo(() => {
    const usados = new Set(usuarios.map(u => u.empleadoId));
    return empleados.filter(e => !usados.has(e.id) || e.id === form.empleadoId);
  }, [empleados, usuarios, form.empleadoId]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nombreUsuario.trim()) errs.nombreUsuario = 'Requerido';
    if (!initialData && !form.contrasenia.trim()) errs.contrasenia = 'Requerido';
    if (!form.empleadoId) errs.empleadoId = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      nombreUsuario: form.nombreUsuario.trim(),
      contrasenia: form.contrasenia.trim(),
      empleadoId: parseInt(form.empleadoId, 10)
    };
    if (initialData) payload.id = initialData.id;
    onSubmit(payload);
  };

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';
  const errorSpan = f => errors[f] ? <span className="text-xs text-red-600 ml-2">{errors[f]}</span> : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-70 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UserCog className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Nombre de Usuario {errorSpan('nombreUsuario')}</label>
            <input name="nombreUsuario" value={form.nombreUsuario} onChange={handleChange} className={inputCls} placeholder="usuario1" />
          </div>
          <div>
            <label className={labelCls}>Contraseña {initialData && <span className="text-xs text-gray-400">(dejar en blanco para no cambiar)</span>} {errorSpan('contrasenia')}</label>
            <input type="password" name="contrasenia" value={form.contrasenia} onChange={handleChange} className={inputCls} placeholder={initialData ? '••••••••' : 'Contraseña'} />
          </div>
          <div>
            <label className={labelCls}>Empleado vinculado {errorSpan('empleadoId')}</label>
            <select name="empleadoId" value={form.empleadoId} onChange={handleChange} className={inputCls}>
              <option value="">Seleccione...</option>
              {empleadosDisponibles.map(e => (
                <option key={e.id} value={e.id}>{e.nombre} (#{e.id})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="button" onClick={handleSubmit} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">{initialData ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearUsuario;

