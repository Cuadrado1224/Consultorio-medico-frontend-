import React, { useEffect, useState } from "react";
import { X } from "lucide-react";


const CrearPacienteModal = ({ show, onClose, onSubmit, initialData = null, centros = [], mode = "create" }) => {
  const [formData, setFormData] = useState({
    idPaciente: null,
    nombre: "",
    cedula: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
    idCentroMedico: "",
  });
  const [localError, setLocalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Helper: formatea varias entradas a yyyy-mm-dd para <input type="date">
  const formatDateForInput = (value) => {
    if (!value) return "";
    // Si ya viene en ISO con T
    if (typeof value === "string" && value.includes("T")) {
      return value.split("T")[0];
    }
    // Si viene como yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    // Si viene como dd/MM/yyyy (ej: 04/05/2004) -> asumimos dd/MM/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      const parts = value.split("/");
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
    // Fallback: intentar construir Date
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return "";
  };

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setFormData({
        idPaciente: initialData.idPaciente ?? null,
        nombre: initialData.nombre ?? "",
        cedula: initialData.cedula ?? "",
        fechaNacimiento: formatDateForInput(initialData.fechaNacimiento ?? ""),
        telefono: initialData.telefono ?? "",
        direccion: initialData.direccion ?? "",
        idCentroMedico: initialData.centroMedico?.id ?? initialData.idCentroMedico ?? "",
      });
    } else {
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
    setLocalError(null);
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initialData]);

  const disabled = mode === "view" || submitting;

  const handleChange = (key, value) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setLocalError(null);
  };

  const handleSubmit = async () => {
    // en view mode no submit
    if (mode === "view") {
      onClose();
      return;
    }

    // Validaciones mínimas
    if (!formData.nombre?.trim()) {
      setLocalError("Nombre es requerido");
      return;
    }
    if (!formData.cedula?.trim()) {
      setLocalError("Cédula es requerida");
      return;
    }
    if (!formData.idCentroMedico) {
      setLocalError("Seleccione un Centro Médico");
      return;
    }

    const payload = {
      idPaciente: Number(formData.idPaciente ?? 0),
      nombre: formData.nombre,
      cedula: formData.cedula,
      fechaNacimiento: formData.fechaNacimiento, // deja el formato yyyy-mm-dd o como el usuario lo puso
      telefono: formData.telefono,
      direccion: formData.direccion,
      idCentroMedico: Number(formData.idCentroMedico),
    };

    try {
      setSubmitting(true);
      await onSubmit(payload); // el padre hace POST/PUT y puede lanzar error
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || String(err);
      setLocalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor" />
                <path d="M4 20v-1c0-2.76 5.58-4 8-4s8 1.24 8 4v1H4z" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{mode === "view" ? "Detalles del Paciente" : (initialData ? "Editar Paciente" : "Nuevo Paciente")}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={formData.nombre} onChange={(e) => handleChange("nombre", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={disabled} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
              <input type="text" value={formData.cedula} onChange={(e) => handleChange("cedula", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={disabled} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input type="date" value={formData.fechaNacimiento} onChange={(e) => handleChange("fechaNacimiento", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={disabled} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={disabled} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" value={formData.direccion} onChange={(e) => handleChange("direccion", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={disabled} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Centro Médico *</label>
              {mode === "view" ? (
                // Mostrar nombre del centro en view
                <input type="text" value={(centrosFindName(centros, formData.idCentroMedico) || "")} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50" disabled />
              ) : (
                <select value={formData.idCentroMedico ?? ""} onChange={(e) => handleChange("idCentroMedico", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={disabled}>
                  <option value="">-- Seleccione un centro --</option>
                  {Array.isArray(centros) && centros.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}{c.ciudad ? ` - ${c.ciudad}` : ""}</option>
                  ))}
                </select>
              )}
            </div>

            {localError && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{localError}</div>}
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" disabled={submitting}>Cancelar</button>
            {mode !== "view" && (
              <button type="button" onClick={handleSubmit} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50" disabled={submitting}>
                {submitting ? "Guardando..." : (initialData ? "Actualizar" : "Guardar")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper outside the component to avoid redeclaring on each render
function centrosFindName(centros, id) {
  if (!Array.isArray(centros)) return "";
  const c = centros.find(x => String(x.id) === String(id));
  return c ? `${c.nombre}${c.ciudad ? ` - ${c.ciudad}` : ""}` : "";
}

export default CrearPacienteModal;
