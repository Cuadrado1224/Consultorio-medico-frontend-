import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Eye, Edit2, Trash2, AlertCircle } from "lucide-react";
import { http } from "../service/httpClient";
import CrearPacienteModal from "./ui/CrearPacienteModal";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCentros, setLoadingCentros] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit | view
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarDatos = useCallback(async () => {
    setError(null);
    setLoading(true);
    setLoadingCentros(true);

    const pacientesPromise = http.get("/CentroMedico/Pacientes").catch(e => e);
    const centrosPromise = http.get("/Administracion/CentrosMedicos").catch(e => e);

    const [pacientesRes, centrosRes] = await Promise.all([pacientesPromise, centrosPromise]);

    // pacientes
    if (pacientesRes instanceof Error) {
      console.error("Error cargando pacientes:", pacientesRes);
      setError(prev => prev ? prev + " | Error pacientes" : "Error cargando pacientes");
      setPacientes([]);
    } else {
      const d = pacientesRes?.data;
      const lista = Array.isArray(d) ? d : Array.isArray(d?.pacientes) ? d.pacientes : Array.isArray(d?.data) ? d.data : [];
      setPacientes(lista);
    }
    setLoading(false);

    // centros
    if (centrosRes instanceof Error) {
      console.error("Error cargando centros:", centrosRes);
      setError(prev => prev ? prev + " | Error centros" : "Error cargando centros médicos");
      setCentros([]);
    } else {
      const d = centrosRes?.data;
      const lista = Array.isArray(d) ? d : Array.isArray(d?.centros) ? d.centros : Array.isArray(d?.data) ? d.data : [];
      setCentros(lista);
    }
    setLoadingCentros(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirModal = (modo, paciente = null) => {
    setModalMode(modo);
    setSelectedPaciente(paciente);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedPaciente(null);
  };

  const handleCreateOrUpdate = async (payload) => {
    try {
      setSubmitting(true);
      if (payload.idPaciente && payload.idPaciente > 0) {
        await http.put(`/CentroMedico/Pacientes/${payload.idPaciente}`, payload);
      } else {
        await http.post("/CentroMedico/Pacientes", payload);
      }
      await cargarDatos();
    } catch (err) {
      console.error("Error guardando paciente:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const eliminarPaciente = async (paciente) => {
    try {
      const ok = window.confirm(`¿Eliminar paciente "${paciente.nombre}" (cédula: ${paciente.cedula})?`);
      if (!ok) return;

      setSubmitting(true);
      setError(null);

      // Construir body completo tal como espera el backend
      const payload = {
        idPaciente: Number(paciente.idPaciente),
        nombre: paciente.nombre ?? "",
        cedula: paciente.cedula ?? "",
        fechaNacimiento: paciente.fechaNacimiento ?? "",
        telefono: paciente.telefono ?? "",
        direccion: paciente.direccion ?? "",
        idCentroMedico: Number(paciente?.centroMedico?.id ?? paciente?.idCentroMedico ?? 0),
      };

      await http.delete(`/CentroMedico/Pacientes/${paciente.idPaciente}`, { data: payload });
      await cargarDatos();
    } catch (err) {
      console.error("Error eliminando paciente:", err);
      const msg = err?.response?.data?.message || err?.message || String(err);
      setError("Error al eliminar paciente: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre ?? ""} ${p.cedula ?? ""} ${p.telefono ?? ""} ${p.direccion ?? ""}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <CrearPacienteModal
        show={showModal}
        onClose={cerrarModal}
        onSubmit={handleCreateOrUpdate}
        initialData={modalMode === "edit" || modalMode === "view" ? selectedPaciente : null}
        centros={centros}
        mode={modalMode}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600 text-sm">Administra los pacientes del centro médico</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="text" placeholder="Buscar por nombre, cédula, teléfono..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <button onClick={() => { setModalMode("create"); setSelectedPaciente(null); setShowModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo
          </button>
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
                      <button onClick={() => { setModalMode("view"); setSelectedPaciente(p); setShowModal(true); }} className="text-blue-600 hover:text-blue-900 mr-2"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setModalMode("edit"); setSelectedPaciente(p); setShowModal(true); }} className="text-yellow-600 hover:text-yellow-900 mr-2"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => eliminarPaciente(p)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
