import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from "react-router-dom";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0', '#19FFD1'];

export default function ReportesGlobales() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [inversionGlobal, setInversionGlobal] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [resumen, setResumen] = useState({
    proyectosActivos: 0,
    utilidadProyectada: 0,
    gastosTotales: 0
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const resInversion = await fetch("http://localhost:3000/api/reportes/inversion-global");
        const dataInversion = await resInversion.json();
        setInversionGlobal(parseFloat(dataInversion.inversionGlobal) || 0);

        const resGastos = await fetch("http://localhost:3000/api/reportes/gastos-por-categoria");
        const dataGastos = await resGastos.json();
        const formattedGastos = dataGastos.map(item => ({
          name: item.categoria,
          value: parseFloat(item.gastoTotal) || 0
        }));
        setGastosPorCategoria(formattedGastos);

        const resResumen = await fetch("http://localhost:3000/api/reportes/resumen-financiero");
        const dataResumen = await resResumen.json();
        setResumen(dataResumen);

      } catch (err) {
        console.error("Error cargando reportes:", err);
        setError("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-gray-400 animate-pulse">
      CARGANDO ANALÍTICA...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600 font-bold">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado dinámico */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <button 
              onClick={() => navigate("/admin")}
              className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2 hover:underline"
            >
              ← Volver al Panel
            </button>
            <h1 className="text-5xl font-black tracking-tighter">Reportes Globales</h1>
            <p className="text-gray-400 mt-2 text-lg italic">Datos extraídos en tiempo real de la base de datos.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inversión Total Comprometida</p>
            <p className="text-4xl font-black text-blue-600">
              ${inversionGlobal.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Gráfico Circular Real */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center">
            <h2 className="text-2xl font-black mb-6 text-center">Distribución de Gastos</h2>
            {gastosPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400 italic text-center">
                Sin datos de gastos registrados aún.
              </div>
            )}
          </div>

          {/* Resumen Financiero con Datos de la DB */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col justify-center">
            <h2 className="text-2xl font-black mb-8 text-center">Resumen Financiero Real</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Proyectos Activos</span>
                <span className="text-2xl font-black">{resumen.proyectosActivos}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Utilidad Proyectada</span>
                <span className="text-2xl font-black text-green-600">
                  ${resumen.utilidadProyectada.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Gastos Acumulados</span>
                <span className="text-2xl font-black text-red-600">
                  ${resumen.gastosTotales.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="mt-8 text-[10px] text-gray-300 text-center uppercase tracking-widest font-bold">
              Cálculos basados en presupuestos y rubros pagados
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}