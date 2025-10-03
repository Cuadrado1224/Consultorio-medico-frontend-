import { useEffect, useState } from "react";
import { http } from "../service/httpClient";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Reportes = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosNombres, setEmpleadosNombres] = useState([]);
  const [salarios, setSalarios] = useState([]);
  const [empleadosPorCentro, setEmpleadosPorCentro] = useState({});
  const [salariosPromedioPorCentro, setSalariosPromedioPorCentro] = useState(
    {}
  );

  const obtenerEmpleados = async () => {
    try {
      const response = await http.get("/Administracion/Empleados");
      const empleadosOrdenados = response.data.empleados.sort(
        (a, b) => b.salario - a.salario
      );
      setEmpleados(empleadosOrdenados);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  useEffect(() => {
    const nuevosEmpleadosNombres = empleados.map((empleado) => ({
      id: empleado.id,
      nombre: empleado.nombre,
    }));
    const nuevosSalarios = empleados.map((empleado) => ({
      id: empleado.id,
      salario: empleado.salario,
    }));
    setEmpleadosNombres(nuevosEmpleadosNombres);
    setSalarios(nuevosSalarios);

    const conteoPorCentro = empleados.reduce((acc, empleado) => {
      const centroNombre = empleado.centroMedico.nombre;
      acc[centroNombre] = (acc[centroNombre] || 0) + 1;
      return acc;
    }, {});
    setEmpleadosPorCentro(conteoPorCentro);

    const salariosPorCentro = empleados.reduce((acc, empleado) => {
      const centroNombre = empleado.centroMedico.nombre;
      if (!acc[centroNombre]) {
        acc[centroNombre] = { total: 0, count: 0 };
      }
      acc[centroNombre].total += empleado.salario;
      acc[centroNombre].count += 1;
      return acc;
    }, {});
    const promedioPorCentro = Object.keys(salariosPorCentro).reduce(
      (acc, centro) => {
        acc[centro] =
          salariosPorCentro[centro].total / salariosPorCentro[centro].count;
        return acc;
      },
      {}
    );
    setSalariosPromedioPorCentro(promedioPorCentro);
  }, [empleados]);

  // Preparar datos para el gráfico de barras (salarios)
  const barChartData = {
    labels: empleadosNombres.map((emp) => emp.nombre),
    datasets: [
      {
        label: "Salarios",
        data: salarios.map((sal) => sal.salario),
        backgroundColor: "rgba(83, 162, 190, 0.6)",
        borderColor: "rgba(83, 162, 190, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Salarios de Empleados (Ordenados de Mayor a Menor)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Salario",
        },
      },
      x: {
        title: {
          display: true,
          text: "Empleados",
        },
      },
    },
  };

  // Preparar datos para el gráfico de pastel (empleados por centro médico)
  const pieChartData = {
    labels: Object.keys(empleadosPorCentro),
    datasets: [
      {
        label: "Empleados por Centro",
        data: Object.values(empleadosPorCentro),
        backgroundColor: [
          "rgba(10, 34, 57, 0.6)",
          "rgba(83, 162, 190, 0.6)",
          "rgba(29, 132, 181, 0.6)",
        ],
        borderColor: [
          "rgba(10, 34, 57, 1)",
          "rgba(83, 162, 190, 1)",
          "rgba(29, 132, 181, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Distribución de Empleados por Centro Médico",
      },
    },
  };

  // Preparar datos para el gráfico de líneas (salarios promedio por centro)
  const lineChartData = {
    labels: Object.keys(salariosPromedioPorCentro),
    datasets: [
      {
        label: "Salario Promedio",
        data: Object.values(salariosPromedioPorCentro),
        fill: false,
        backgroundColor: "rgba(10, 34, 57, 0.6)",
        borderColor: "rgba(10, 34, 57, 1)",
        tension: 0.1,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Salario Promedio por Centro Médico",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Salario Promedio",
        },
      },
      x: {
        title: {
          display: true,
          text: "Centro Médico",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Reportes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contenedor para los dos primeros gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
          {/* Gráfico de barras */}
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
              Salarios de Empleados
            </h3>
            <div className="flex-1">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Gráfico de pastel */}
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
              Empleados por Centro Médico
            </h3>
            <div className="flex-1 max-w-[300px] mx-auto">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* Gráfico de líneas debajo */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
              Salario Promedio por Centro
            </h3>
            <div className="flex-1">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
