import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Phone,
  Home,
  Calendar,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import { http } from "../service/httpClient"; 

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [formData, setFormData] = useState({
    idPaciente: null,
    nombre: "",
    cedula: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
    idCentroMedico: "",
  });

  // Cargar pacientes desde /CentroMedico/Pacientes
  const cargarPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await http.get("/CentroMedico/Pacientes");
      let lista = [];
      if (Array.isArray(res?.data)) {
        lista = res.data;
      } else if (res?.data?.pacientes && Array.isArray(res.data.pacientes)) {
        lista = res.data.pacientes;
      } else if (Array.isArray(res)) {
        lista = res;
      } else if (res?.pacientes && Array.isArray(res.pacientes)) {
        lista = res.pacientes;
      } else {
        lista = [];
      }

      setPacientes(lista);
    } catch (err) {
      console.error("Error cargando pacientes:", err);
      setError("Error al cargar pacientes: " + (err.message || err));
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  const abrirModal = (modo, paciente = null) => {
    setModalMode(modo);
    if (paciente) {
      setSelectedPaciente(paciente);
      setFormData({
        idPaciente: paciente.idPaciente ?? null,
        nombre: paciente.nombre ?? "",
        cedula: paciente.cedula ?? "",
        fechaNacimiento:
          paciente.fechaNacimiento?.split?.("T")?.[0] ??
          paciente.fechaNacimiento ??
          "",
        telefono: paciente.telefono ?? "",
        direccion: paciente.direccion ?? "",
        idCentroMedico: paciente.centroMedico?.id ?? "",
      });
    } else {
      setSelectedPaciente(null);
      setFormData({
        idPaciente: null,
        nombre: "",
        cedula: "",
        fechaNacimiento: "",
        telefono: "",
        direccion: "",
        idCentroMedico: "",
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedPaciente(null);
  };

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const guardarPaciente = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Validaciones mínimas
      if (!formData.nombre || !formData.cedula) {
        setError("Nombre y cédula son obligatorios");
        return;
      }

      // Preparar payload según lo que espera tu API
      const payload = {
        idPaciente: formData.idPaciente ?? 0,
        nombre: formData.nombre,
        cedula: formData.cedula,
        fechaNacimiento: formData.fechaNacimiento,
        telefono: formData.telefono,
        direccion: formData.direccion,
        idCentroMedico: formData.idCentroMedico ? Number(formData.idCentroMedico) : 0,
      };

      if (modalMode === "create") {
        await http.post("/CentroMedico/Pacientes", payload);
      } else if (modalMode === "edit") {
        // muchos backends aceptan PUT /CentroMedico/Pacientes/{id} o PUT /CentroMedico/Pacientes
        // intento con la forma más habitual (con id en la ruta). Si tu API usa otra, cámbialo.
        if (payload.idPaciente) {
          await http.put(`/CentroMedico/Pacientes/${payload.idPaciente}`, payload);
        } else {
          // fallback: enviar PUT al endpoint raíz
          await http.put("/CentroMedico/Pacientes", payload);
        }
      }

      await cargarPacientes();
      cerrarModal();
    } catch (err) {
      console.error("Error guardando paciente:", err);
      setError("Error al guardar paciente: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const eliminarPaciente = async (paciente) => {
    try {
      // confirmación nativa (puedes reemplazar por modal si prefieres)
      const ok = window.confirm(
        `¿Eliminar paciente "${paciente.nombre}" (cédula: ${paciente.cedula})?`
      );
      if (!ok) return;

      setSubmitting(true);
      setError(null);

      // Tu backend mencionaba DELETE con body: lo enviamos así
      // Si tu backend en cambio acepta DELETE /CentroMedico/Pacientes/{id}, cambiar a esa ruta.
      await http.delete("/CentroMedico/Pacientes", {
        data: { idPaciente: paciente.idPaciente },
      });

      await cargarPacientes();
    } catch (err) {
      console.error("Error eliminando paciente:", err);
      setError("Error al eliminar paciente: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre ?? ""} ${p.cedula ?? ""} ${p.telefono ?? ""} ${p.direccion ?? ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
        <button
          onClick={() => abrirModal("create")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-6 text-center">Cargando pacientes...</div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="p-6 text-center">No hay pacientes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centro Médico</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pacientesFiltrados.map((p) => (
                  <tr key={p.idPaciente} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{p.nombre}</td>
                    <td className="px-6 py-4">{p.cedula}</td>
                    <td className="px-6 py-4">{p.telefono}</td>
                    <td className="px-6 py-4">{p.direccion}</td>
                    <td className="px-6 py-4">{p.centroMedico?.nombre}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => abrirModal("view", p)} className="text-blue-600 hover:text-blue-900 mr-2">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => abrirModal("edit", p)} className="text-yellow-600 hover:text-yellow-900 mr-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => eliminarPaciente(p)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar/Ver */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-semibold">
                {modalMode === "create" ? "Nuevo Paciente" : modalMode === "edit" ? "Editar Paciente" : "Detalles del Paciente"}
              </h2>
              <button onClick={cerrarModal}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => handleFormChange("nombre", e.target.value)}
                disabled={modalMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Cédula"
                value={formData.cedula}
                onChange={(e) => handleFormChange("cedula", e.target.value)}
                disabled={modalMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                placeholder="Fecha de nacimiento"
                value={formData.fechaNacimiento}
                onChange={(e) => handleFormChange("fechaNacimiento", e.target.value)}
                disabled={modalMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleFormChange("telefono", e.target.value)}
                disabled={modalMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={(e) => handleFormChange("direccion", e.target.value)}
                disabled={modalMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="ID Centro Médico"
                value={formData.idCentroMedico}
                onChange={(e) => handleFormChange("idCentroMedico", e.target.value)}
                disabled={modalMode === "view"}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {modalMode !== "view" && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarPaciente}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mt-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Pacientes;
