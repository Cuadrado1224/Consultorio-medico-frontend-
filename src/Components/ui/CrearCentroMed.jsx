import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';

const CrearCentroMed = ({ show, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({ nombre: '', ciudad: '', direccion: '' });

  useEffect(() => {
    if (show) {
      setFormData(initialData || { nombre: '', ciudad: '', direccion: '' });
    }
  }, [show, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, id: initialData?.id });
    onClose();
  };

  if (!show) return null;

  return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">

      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
       
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {initialData ? 'Editar Centro Médico' : 'Nuevo Centro Médico'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Formulario */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Nombre del Centro
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hospital Central"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Quito"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Av. Principal"
              />
            </div>
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearCentroMed;