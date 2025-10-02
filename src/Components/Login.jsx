import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/Logo.png";
import Swal from "sweetalert2";

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    contrasenia: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: "#e8f5e9",
    color: "#2e7d32",
    iconColor: "#4caf50",
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.nombreUsuario || !formData.contrasenia) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }
    try {
      const result = await login(
        {
          nombreUsuario: formData.nombreUsuario,
          contrasenia: formData.contrasenia,
        },
        formData.remember
      );
      if (!result.success) {
        setError(result.error);
        Swal.fire({
          title: "Error",
          text: result.error || "Error al iniciar sesión",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setLoading(false);
        return;
      } else {
        Toast.fire({
          title: "Inicio de sesión correcto!",
          icon: "success",
        }).then(() => {
          navigate("/");
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || "Error al iniciar sesión",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-70 via-white to-cyan-70 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-30 h-30 mb-4">
            <img
              src={Logo}
              alt="Logo"
              className="w-80 h-40 object-contain drop-shadow-sm select-none"
              draggable={false}
            />
          </div>
          <p className="text-gray-600 font-semibold tracking-wide text-xl md:text-2xl">
            Sistema de Gestión Hospitalaria
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.nombreUsuario}
                onChange={(e) =>
                  setFormData({ ...formData, nombreUsuario: e.target.value })
                }
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="Usuario"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.contrasenia}
                  onChange={(e) =>
                    setFormData({ ...formData, contrasenia: e.target.value })
                  }
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 text-lg"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                  disabled={loading}
                />
                <span className="ml-2 text-base text-gray-700">Recordarme</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-700">
              ¿Necesitas acceso?
              <button className="text-blue-600 hover:underline ml-1 text-base font-semibold">
                Contacta a soporte
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-base text-gray-500 font-medium">
          <p>© 2024 MediCity+. Sistema seguro y confiable.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
