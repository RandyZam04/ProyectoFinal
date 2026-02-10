import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Solo añadí useNavigate aquí
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import SeccionPresupuesto from "./SeccionPresupuesto"; 
import SeccionAvances from "./SeccionAvances";

export default function DetalleProyectoAdmin() {
  const { id } = useParams();
  const navigate = useNavigate(); // <-- Añadido
  const [tabActual, setTabActual] = useState("resumen");
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [metricas, setMetricas] = useState({ 
    presupuestoObra: 0, 
    totalGastado: 0,
    balance: 0,
    ejecucion: 0 
  });

  // --- TU LÓGICA DE CARGA (INTACTA) ---
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        setLoading(true);
        const [resProy, resPres] = await Promise.all([
          fetch(`http://localhost:3000/api/proyecto-individual/${id}`),
          fetch(`http://localhost:3000/api/presupuestos/proyecto/${id}`)
        ]);

        const dataProy = await resProy.json();
        const dataPres = await resPres.json();
        setProyecto(dataProy);

        const presupuestoTotal = parseFloat(dataPres.total) || 0;
        const listaRubros = dataPres.rubros || [];
        let sumaGastosAcumulados = 0;

        const promesasGastos = listaRubros.map(rubro => 
          fetch(`http://localhost:3000/api/gastos/rubro/${rubro.idrubros}`)
            .then(res => res.json())
            .catch(() => [])
        );

        const resultadosGastos = await Promise.all(promesasGastos);

        resultadosGastos.forEach((listaDeGastos) => {
          if (Array.isArray(listaDeGastos)) {
            listaDeGastos.forEach(gasto => {
              sumaGastosAcumulados += (parseFloat(gasto.monto_gastado) || 0);
            });
          }
        });

        setMetricas({
          presupuestoObra: presupuestoTotal,
          totalGastado: sumaGastosAcumulados,
          balance: presupuestoTotal - sumaGastosAcumulados,
          ejecucion: presupuestoTotal > 0 ? (sumaGastosAcumulados / presupuestoTotal) * 100 : 0
        });

      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, [id]);

  // --- TU LÓGICA DE PDF (INTACTA) ---
  const exportarPDF = () => {
    if (!proyecto) return;
    const doc = new jsPDF();
    const fechaReporte = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text(`Reporte de Obra: ${proyecto.nombre}`, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generado el: ${fechaReporte}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Indicador', 'Valor']],
      body: [
        ['Presupuesto Asignado', `$${metricas.presupuestoObra.toLocaleString()}`],
        ['Gasto Acumulado', `$${metricas.totalGastado.toLocaleString()}`],
        ['Saldo Disponible', `$${metricas.balance.toLocaleString()}`],
        ['Porcentaje de Ejecución', `${metricas.ejecucion.toFixed(2)}%`],
      ],
      headStyles: { fillColor: [29, 78, 216] }
    });

    doc.save(`Reporte_${proyecto.nombre}.pdf`);
  };

  const obtenerColorEjecucion = (p) => {
    if (p > 100) return "text-red-600 animate-pulse";
    if (p > 90) return "text-red-500";
    if (p > 70) return "text-orange-500";
    return "text-green-600";
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b border-gray-200 pt-12 pb-1">
        <div className="max-w-6xl mx-auto px-8">
          
          {/* AQUÍ ESTÁ EL BOTÓN DE REGRESAR */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-blue-600 transition-colors mb-4 group"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
            Regresar
          </button>

          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Gestión de Obra</span>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter mt-1">{proyecto?.nombre}</h1>
              <p className="text-gray-400 mt-2 text-lg italic">"{proyecto?.descripcion}"</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={exportarPDF}
                className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
              >
                Exportar PDF
              </button>
              <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estatus</p>
                <p className="font-black text-blue-700 text-xl italic tracking-tighter">Activo</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-10">
            {["resumen", "presupuesto", "avances"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActual(tab)}
                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] relative transition-colors ${
                  tabActual === tab ? "text-blue-700" : "text-gray-300 hover:text-gray-500"
                }`}
              >
                {tab}
                {tabActual === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-700 rounded-t-full shadow-md"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {tabActual === "resumen" && (
          <div className="animate-fadeIn space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ejecución Presupuestaria</p>
                <p className={`text-6xl font-black tracking-tighter ${obtenerColorEjecucion(metricas.ejecucion)}`}>
                  {metricas.ejecucion.toFixed(1)}%
                </p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tiempo Transcurrido</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-6xl font-black text-gray-900 tracking-tighter">
                    {Math.floor((new Date() - new Date(proyecto?.fecha_inicio)) / (1000*60*60*24)) || 1}
                  </p>
                  <p className="text-xl font-black text-gray-300 uppercase italic">Días</p>
                </div>
              </div>

              <div className="bg-blue-700 p-10 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center">
                <p className="text-2xl font-bold italic">"El orden en el presupuesto es el éxito en la entrega."</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="pb-6 md:pb-0 md:pr-10">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Presupuesto Global</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">${metricas.presupuestoObra.toLocaleString()}</p>
              </div>
              <div className="py-6 md:py-0 md:px-10 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Gastado</p>
                <p className="text-4xl font-black text-blue-700 tracking-tighter">${metricas.totalGastado.toLocaleString()}</p>
              </div>
              <div className="pt-6 md:pt-0 md:pl-10 text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Balance Disponible</p>
                <p className={`text-4xl font-black tracking-tighter ${metricas.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  ${metricas.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {tabActual === "presupuesto" && <SeccionPresupuesto idProyecto={id} />}
        {tabActual === "avances" && <SeccionAvances idProyecto={id} />}
      </div>
    </div>
  );
}