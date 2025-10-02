import React, { useEffect, useState } from "react";
import { http } from "../service/httpClient";
import ModalAgregarCentro from "./ui/CrearCentroMed";
import Swal from "sweetalert2";

const CentroMedico = () => {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [centroEdit, setCentroEdit] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await http.get("Administracion/CentrosMedicos");
        let lista = [];
        if (Array.isArray(data)) lista = data;
        else if (Array.isArray(data?.data)) lista = data.data;
        else if (Array.isArray(data?.centros)) lista = data.centros;
        setCentros(lista);
      } catch (e) {
        console.error("Error obteniendo centros médicos", e);
        setError("No se pudieron cargar los centros médicos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = centros.filter((c) => {
    if (!filter.trim()) return true;
    const f = filter.toLowerCase();
    return (c.nombre || "").toLowerCase().includes(f);
  });

  const handleAddCentro = async (nuevoCentro) => {
    try {
      const { data } = await http.post(
        "Administracion/CentrosMedicos",
        nuevoCentro
      );
      setCentros((prev) => [...prev, data]);
      setShowModal(false);
      setCentroEdit(null);
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#e8f5e9",
        color: "#2e7d32",
        iconColor: "#4caf50",
        title: "Centro médico creado correctamente!",
        icon: "success",
      });
    } catch (e) {
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#ffebee",
        color: "#b71c1c",
        iconColor: "#d32f2f",
        title: e?.response?.data?.message || "Error al crear centro médico",
        icon: "error",
      });
    }
  };

  const handleEditClick = (centro) => {
    setCentroEdit(centro);
    setShowModal(true);
  };

  const handleUpdateCentro = async (centroActualizado) => {
    try {
      const { data } = await http.put(
        `Administracion/CentrosMedicos/${centroActualizado.id}`,
        centroActualizado
      );
      setCentros((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      setShowModal(false);
      setCentroEdit(null);
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#e8f5e9",
        color: "#2e7d32",
        iconColor: "#4caf50",
        title: "Centro médico actualizado correctamente!",
        icon: "success",
      });
    } catch (e) {
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#ffebee",
        color: "#b71c1c",
        iconColor: "#d32f2f",
        title:
          e?.response?.data?.message || "Error al actualizar centro médico",
        icon: "error",
      });
    }
  };

  const handleDeleteCentro = async (id) => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Quieres eliminar este centro médico?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar centro médico",
        cancelButtonText: "Cancelar",
      });
      if (result.isConfirmed) {
        await http.delete(`Administracion/CentrosMedicos/${id}`);
        setCentros((prev) => prev.filter((c) => c.id !== id));
        Swal.fire({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#e8f5e9",
          color: "#2e7d32",
          iconColor: "#4caf50",
          title: "Centro médico eliminado correctamente!",
          icon: "success",
        });
      }
    } catch (e) {
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#ffebee",
        color: "#b71c1c",
        iconColor: "#d32f2f",
        title: e?.response?.data?.message || "Error al eliminar centro médico",
        icon: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <ModalAgregarCentro
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setCentroEdit(null);
        }}
        onSubmit={centroEdit ? handleUpdateCentro : handleAddCentro}
        initialData={centroEdit}
      />
      <div>
        <h1 className="text-4xl font-semibold text-gray-900">
          Centros Médicos
        </h1>
        <p className="mt-1 text-xl text-gray-600">
          Listado de centros registrados en el sistema.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Buscar por nombre ..."
            className="w-full rounded-lg border border-gray-300 px-6 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button
            className="bg-blue-600 text-white text-lg font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              setShowModal(true);
              setCentroEdit(null);
            }}
          >
            Nuevo Centro
          </button>
          <button
            onClick={() => {
              setFilter("");
            }}
            className="text-lg px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 text-lg uppercase text-gray-600 tracking-wide">
              <tr>
                <th className="text-left px-9 py-4 font-medium">Nombre</th>
                <th className="text-left px-9 py-4 font-medium">Ciudad</th>
                <th className="text-left px-9 py-4 font-medium">Dirección</th>
                <th className="px-4 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-lg divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Cargando centros médicos...
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No hay resultados
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-9 py-4 font-medium text-gray-900">
                      {c.nombre || "—"}
                    </td>
                    <td className="px-9 py-4 text-gray-700">
                      {c.ciudad || "—"}
                    </td>
                    <td className="px-9 py-4   text-gray-700">
                      {c.direccion || "—"}
                    </td>
                    <td className="px-4 py-5 text-right">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-lg font-medium mr-3"
                        onClick={() => handleEditClick(c)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 text-lg  font-medium"
                        onClick={() => handleDeleteCentro(c.id)}
                      >
                        Eliminar
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

export default CentroMedico;
