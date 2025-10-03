import React, { useEffect, useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

const CrearEspecialidad = ({ show, onClose, onSubmit }) => {
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (show) setNombre('');
  }, [show]);

  if (!show) return null;

  const handleSubmit = () => {
    if (!nombre.trim()) return;
    onSubmit({ especialidad: nombre.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-70 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Nueva Especialidad</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Nombre de la Especialidad</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Cardiología"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!nombre.trim()}
              className="flex-1 px-6 py-3 bg-emerald-600 disabled:opacity-60 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearEspecialidad;

