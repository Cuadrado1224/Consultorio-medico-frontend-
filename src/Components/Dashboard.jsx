import React, { useEffect, useState } from "react";
import {
  Heart,
  Hospital,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Stethoscope,
  Book,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CentroMedico from "./CentroMedico";
import Empleados from "./Empleados";
import Resumen from "./Resumen";
import Reportes from "./Reportes";
import Citas from "./Citas";
import Personal from "./Personal";
import Pacientes from "./Pacientes";
import Logo from "../assets/Logo.png";
import { tokenUtils } from "../utils/TokenUtils";
import Swal from "sweetalert2";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("resume");
  const [isAdmin, setIsAdmin] = useState(false);

  // Extrae TipoEmpleado desde el token JWT de forma segura
  const getTipoEmpleadoFromToken = () => {
    try {
      const token = tokenUtils?.get && tokenUtils.get();
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      // Buscar claves posibles (case-insensitive)
      const keys = Object.keys(payload || {});
      const keyFound = keys.find((k) => k.toLowerCase() === "tipoempleado" || k.toLowerCase() === "tipo_empleado" || k.toLowerCase() === "tipo");
      if (keyFound) return payload[keyFound];
      // fallback directo
      return payload.TipoEmpleado || payload.tipoEmpleado || null;
    } catch (e) {
      console.warn("No se pudo leer TipoEmpleado desde token:", e);
      return null;
    }
  };

  useEffect(() => {
    const tipo = getTipoEmpleadoFromToken();
    setIsAdmin(typeof tipo === "string" && tipo.toLowerCase() === "administrador");
  }, []);

  // Menú dependiendo del rol
  const adminMenu = [
    { id: "resume", label: "Resumen", icon: BookOpen },
    { id: "employees", label: "Empleados", icon: Users },
    { id: "centers", label: "Centros Médicos", icon: Hospital },
    { id: "patients", label: "Pacientes", icon: Heart },
    { id: "reports", label: "Citas Medicas", icon: Calendar },
    { id: "medical-records", label: "Reportes", icon: FileText },
    { id: "staff", label: "Personal", icon: Stethoscope },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const restrictedMenu = [
    { id: "patients", label: "Pacientes", icon: Heart },
    { id: "reports", label: "Citas Medicas", icon: Calendar },
  ];

  const menuItems = isAdmin ? adminMenu : restrictedMenu;

  // Si la sección activa no está permitida por el rol, cambiarla al primer item disponible
  useEffect(() => {
    const allowedIds = menuItems.map((m) => m.id);
    if (!allowedIds.includes(activeSection)) {
      setActiveSection(allowedIds[0] || "resume");
    }
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderContent = () => {
    switch (activeSection) {
      case "resume":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Resumen />
          </div>
        );
      case "patients":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Pacientes />
          </div>
        );
      case "centers":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <CentroMedico />
          </div>
        );
      case "employees":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Empleados />
          </div>
        );
      case "reports":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Citas />
          </div>
        );
      case "medical-records":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Reportes />
          </div>
        );
      case "staff":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Personal />
          </div>
        );
      case "settings":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-xl font-semibold mb-2">Configuración</h1>
              <p className="text-gray-600 text-sm">Preferencias de la aplicación.</p>
            </div>
          </div>
        );
      case "overview":
      default:
        return <Resumen />;
    }
  };

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Quieres cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
      });
      if (result.isConfirmed) {
        await logout();
        Swal.fire({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          background: "#e8f5e9",
          color: "#2e7d32",
          iconColor: "#4caf50",
          title: "Sesión cerrada correctamente!",
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
        title: e?.response?.data?.message || "Error al cerrar sesión",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 relative">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-2 ml-8">
            <img
              src={Logo}
              alt="Logo"
              className="w-30 h-30 object-contain drop-shadow-sm select-none"
              draggable={false}
            />
          </div>

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-3xl font-bold text-black-700 tracking-wide">
              Sistema de Gestión Hospitalaria
            </span>
          </div>

          <div className="flex items-center space-x-4 mr-8">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xl font-semibold text-gray-900">
                  {user?.name || "Dr. Usuario"}
                </p>
                <p className="text-lg text-gray-500">
                  {user?.department || "Medicina General"}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-base font-medium">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Cerrar sesión"
            >
              <LogOut className="w-10 h-8" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white shadow-sm h-screen sticky top-0">
          <nav className="p-7 space-y-7">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-5 px-7 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-8 h-8" />
                <span className="text-xl">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
