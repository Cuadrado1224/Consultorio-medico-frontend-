import React, { useEffect, useState } from 'react';
import { apiService } from '../service/apiService';



const CentroMedico = () => {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
  const data = await apiService.getCentrosMedicos();
  let lista = [];
  if (Array.isArray(data)) lista = data;
  else if (Array.isArray(data?.data)) lista = data.data;
  else if (Array.isArray(data?.centros)) lista = data.centros;
  setCentros(lista);
      } catch (e) {
        console.error('Error obteniendo centros médicos', e);
        setError('No se pudieron cargar los centros médicos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = centros.filter(c => {
    if (!filter.trim()) return true;
    const f = filter.toLowerCase();
    return (
      (c.nombre || '').toLowerCase().includes(f) ||
      (c.direccion || '').toLowerCase().includes(f) ||
      (c.telefono || '').toLowerCase().includes(f) ||
      (c.ciudad || '').toLowerCase().includes(f)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Centros Médicos</h1>
        <p className="mt-1 text-sm text-gray-600">Listado de centros registrados en el sistema.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Buscar por nombre, dirección o teléfono..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Nuevo Centro</button>
          <button onClick={() => {
            setFilter('');
          }} className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Limpiar</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600 tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Ciudad</th>
                <th className="text-left px-4 py-3 font-medium">Dirección</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Cargando centros médicos...</td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-red-600">{error}</td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No hay resultados</td>
                </tr>
              )}
              {!loading && !error && filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.nombre || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{c.ciudad || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{c.direccion || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3">Editar</button>
                    <button className="text-red-600 hover:text-red-800 text-xs font-medium">Eliminar</button>
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

export default CentroMedico;