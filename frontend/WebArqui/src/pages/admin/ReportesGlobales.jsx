import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from "react-router-dom";

const COLORS = ['#18202b', '#474b54', '#646e75', '#7d8b8d', '#bfb3a3', '#d4cbba', '#dad8cc'];

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
    <div className="min-h-screen bg-[#f4f0eb] flex items-center justify-center font-light uppercase tracking-widest text-[#bfb3a3] text-xs">
      Analizando datos...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f4f0eb] flex items-center justify-center text-red-600 font-bold">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f0eb] p-8 lg:p-12 font-sans text-[#18202b]">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end mb-16 border-b border-[#18202b] pb-6">
          <div>
            <button 
              onClick={() => navigate("/admin")}
              className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.3em] mb-2 hover:text-[#18202b]"
            >
              ← Volver
            </button>
            <h1 className="text-4xl font-light tracking-wide uppercase">Reportes</h1>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-widest">Volumen Total</p>
            <p className="text-3xl font-light text-[#18202b]">
              ${inversionGlobal.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="bg-white p-12 border border-[#d4cbba] flex flex-col items-center shadow-sm">
            <h2 className="text-xl font-light mb-8 text-center uppercase tracking-widest">Gastos por Partida</h2>
            {gastosPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={80}
                    dataKey="value"
                    label={false}
                    stroke="none"
                  >
                    {gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`} 
                    contentStyle={{ backgroundColor: '#18202b', color: '#fff', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#646e75' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[#bfb3a3] italic">Sin datos.</div>
            )}
          </div>

          <div className="bg-white p-12 border border-[#d4cbba] flex flex-col justify-center shadow-sm">
            <h2 className="text-xl font-light mb-10 text-center uppercase tracking-widest">Resumen Ejecutivo</h2>
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-[#f4f0eb] pb-4">
                <span className="text-[10px] font-bold text-[#bfb3a3] uppercase tracking-widest">Obras en Curso</span>
                <span className="text-2xl font-light">{resumen.proyectosActivos}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#f4f0eb] pb-4">
                <span className="text-[10px] font-bold text-[#bfb3a3] uppercase tracking-widest">Utilidad Estimada</span>
                <span className="text-2xl font-light text-[#7d8b8d]">
                  ${resumen.utilidadProyectada.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#bfb3a3] uppercase tracking-widest">Egresos Totales</span>
                <span className="text-2xl font-light text-[#18202b]">
                  ${resumen.gastosTotales.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="mt-12 text-[9px] text-[#bfb3a3] text-center uppercase tracking-widest font-bold">
              Datos generados en tiempo real
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}