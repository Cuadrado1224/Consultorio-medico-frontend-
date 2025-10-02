import React, { useState } from "react";
import {
  Heart,
  Hospital,
  Users,
  Calendar,
  FileText,
  Bell,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CentroMedico from "./CentroMedico";
import Empleados from "./Empleados";
import Resumen from "./Resumen";
import Citas from "./Citas";
import Personal from "./Personal"; // agregado
import Logo from "../assets/Logo.png";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "employees", label: "Empleados", icon: Users },
    { id: "patients", label: "Centros Médicos", icon: Hospital },
    { id: "appointments", label: "Citas", icon: Calendar },
    { id: "medical-records", label: "Historiales", icon: FileText },
    { id: "staff", label: "Personal", icon: Stethoscope },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "patients":
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
      case "appointments":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Citas />
          </div>
        );
      case "medical-records":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-xl font-semibold mb-2">Historiales Médicos</h1>
            <p className="text-gray-600 text-sm">
              Listado / búsqueda de historiales.
            </p>
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
            <h1 className="text-xl font-semibold mb-2">Configuración</h1>
            <p className="text-gray-600 text-sm">
              Preferencias de la aplicación.
            </p>
          </div>
        );
      case "overview":
      default:
        return <Resumen />;
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
              onClick={logout}
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
