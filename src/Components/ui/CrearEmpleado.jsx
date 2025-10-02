import React, { useEffect, useState } from 'react';
import { X, UserPlus, PlusCircle } from 'lucide-react';

/*
  Props:
   show: bool
   onClose: fn
   onSubmit: fn(empleadoForm)
   initialData: empleado existente (para editar) o null
   centros, tipos, especialidades: arrays para selects
   onNuevaEspecialidad: fn() -> abre modal de especialidad
*/
const CrearEmpleado = ({ show, onClose, onSubmit, initialData, centros, tipos, especialidades, onNuevaEspecialidad }) => {
  const empty = { nombre:'', cedula:'', telefono:'', email:'', salario:'', centroMedicoID:'', tipoEmpleadoID:'', especialidadID:'' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setForm(initialData ? {
        id: initialData.id,
        nombre: initialData.nombre || '',
        cedula: initialData.cedula || '',
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        salario: initialData.salario ?? '',
        centroMedicoID: initialData.centroMedicoID || '',
        tipoEmpleadoID: initialData.tipoEmpleadoID || '',
        especialidadID: initialData.especialidadID || ''
      } : empty);
      setErrors({});
    }
  }, [show, initialData]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'Requerido';
    if (!form.cedula.trim()) errs.cedula = 'Requerido';
    if (!form.centroMedicoID) errs.centroMedicoID = 'Requerido';
    if (!form.tipoEmpleadoID) errs.tipoEmpleadoID = 'Requerido';
    if (!form.especialidadID) errs.especialidadID = 'Requerido';
    if (form.salario !== '' && isNaN(parseFloat(form.salario))) errs.salario = 'Numérico';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      salario: form.salario === '' ? 0 : parseFloat(form.salario),
      centroMedicoID: parseInt(form.centroMedicoID),
      tipoEmpleadoID: parseInt(form.tipoEmpleadoID),
      especialidadID: parseInt(form.especialidadID)
    };
    onSubmit(payload);
  };

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-lg font-medium text-gray-700 mb-2";
  const errorSpan = (f) => errors[f] ? <span className="text-sm text-red-600">{errors[f]}</span> : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{initialData ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Nombre {errorSpan('nombre')}</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Dr. Juan Pérez" />
            </div>
            <div>
              <label className={labelCls}>Cédula {errorSpan('cedula')}</label>
              <input name="cedula" value={form.cedula} onChange={handleChange} className={inputCls} placeholder="0102030405" />
            </div>
            <div>
              <label className={labelCls}>Centro Médico {errorSpan('centroMedicoID')}</label>
              <select name="centroMedicoID" value={form.centroMedicoID} onChange={handleChange} className={inputCls}>
                <option value="">Seleccione...</option>
                {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo Empleado {errorSpan('tipoEmpleadoID')}</label>
              <select name="tipoEmpleadoID" value={form.tipoEmpleadoID} onChange={handleChange} className={inputCls}>
                <option value="">Seleccione...</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.tipo}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={"text-lg font-medium text-gray-700"}>Especialidad {errorSpan('especialidadID')}</label>
                <button type="button" onClick={onNuevaEspecialidad} className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                  <PlusCircle className="w-4 h-4" /> Nueva
                </button>
              </div>
              <select name="especialidadID" value={form.especialidadID} onChange={handleChange} className={inputCls}>
                <option value="">Seleccione...</option>
                {especialidades.map(e => <option key={e.id} value={e.id}>{e.especialidad_ || e.especialidad || '—'}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Salario (USD)</label>
              <input name="salario" value={form.salario} onChange={handleChange} className={inputCls} placeholder="1500" />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} className={inputCls} placeholder="0999999999" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls} placeholder="correo@dominio.com" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="button" onClick={handleSubmit} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">{initialData ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearEmpleado;

