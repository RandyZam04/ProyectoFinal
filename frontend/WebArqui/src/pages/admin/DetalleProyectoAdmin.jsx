import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import SeccionPresupuesto from "./SeccionPresupuesto"; 
import SeccionAvances from "./SeccionAvances";

export default function DetalleProyectoAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabActual, setTabActual] = useState("resumen");
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [metricas, setMetricas] = useState({ 
    presupuestoObra: 0, 
    totalGastado: 0,
    balance: 0,
    ejecucion: 0 
  });

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

  const exportarPDF = () => {
    if (!proyecto) return;
    const doc = new jsPDF();
    
    doc.setFont("helvetica");
    doc.text(`STUDIO Z - Reporte de Obra: ${proyecto.nombre}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Concepto', 'Valor']],
      body: [
        ['Presupuesto Asignado', `$${metricas.presupuestoObra.toLocaleString()}`],
        ['Gasto Acumulado', `$${metricas.totalGastado.toLocaleString()}`],
        ['Saldo Disponible', `$${metricas.balance.toLocaleString()}`],
        ['Ejecución', `${metricas.ejecucion.toFixed(2)}%`],
      ],
      styles: { fillColor: [24, 32, 43], fontStyle: 'bold' } 
    });

    doc.save(`StudioZ_Reporte_${proyecto.nombre}.pdf`);
  };

  const obtenerColorEjecucion = (p) => {
    if (p > 100) return "text-red-700";
    return "text-[#18202b]";
  };

  if (loading) return <div className="p-20 text-center font-light text-[#18202b] tracking-widest text-sm">CARGANDO DATOS...</div>;

  return (
    <div className="min-h-screen bg-[#f4f0eb] font-sans">
      <div className="bg-white border-b border-[#d4cbba] pt-12 pb-1">
        <div className="max-w-7xl mx-auto px-8">
          
          <button 
            onClick={() => navigate(-1)} 
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#646e75] hover:text-[#18202b] mb-6 block"
          >
            ← Regresar
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <span className="bg-[#18202b] text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">Proyecto</span>
              <h1 className="text-4xl lg:text-5xl font-light text-[#18202b] mt-3 uppercase">{proyecto?.nombre}</h1>
              <p className="text-[#646e75] mt-2 text-sm font-medium max-w-2xl">{proyecto?.descripcion}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={exportarPDF}
                className="border border-[#18202b] text-[#18202b] hover:bg-[#18202b] hover:text-white px-6 py-3 font-bold text-[10px] uppercase tracking-widest transition-all rounded-none"
              >
                Descargar Informe
              </button>
            </div>
          </div>
          
          <div className="flex gap-12 border-b border-transparent">
            {["resumen", "presupuesto", "avances"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActual(tab)}
                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                  tabActual === tab ? "border-[#18202b] text-[#18202b]" : "border-transparent text-[#bfb3a3] hover:text-[#646e75]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 lg:p-12">
        {tabActual === "resumen" && (
          <div className="animate-fadeIn space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#d4cbba] bg-white">
               
               <div className="p-12 border-b md:border-b-0 md:border-r border-[#d4cbba]">
                 <p className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-[0.2em] mb-4">Progreso de Obra</p>
                 <p className={`text-6xl font-extralight ${obtenerColorEjecucion(metricas.ejecucion)}`}>
                   {metricas.ejecucion.toFixed(1)}<span className="text-2xl text-[#bfb3a3]">%</span>
                 </p>
               </div>

               <div className="p-12 border-b md:border-b-0 md:border-r border-[#d4cbba]">
                 <p className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-[0.2em] mb-4">Días en Ejecución</p>
                 <p className="text-6xl font-extralight text-[#18202b]">
                    {Math.floor((new Date() - new Date(proyecto?.fecha_inicio)) / (1000*60*60*24)) || 1}
                 </p>
               </div>

               <div className="p-12 bg-[#18202b] text-[#f4f0eb] flex items-center">
                 <p className="text-lg font-light italic leading-relaxed">"La arquitectura es la voluntad de la época traducida a espacio."</p>
               </div>
            </div>

            <div className="bg-[#dad8cc]/30 p-12 border border-[#d4cbba] flex flex-col md:flex-row justify-between gap-8">
              <div>
                <p className="text-[9px] font-bold text-[#646e75] uppercase mb-2 tracking-widest">Presupuesto Total</p>
                <p className="text-3xl font-light text-[#18202b]">${metricas.presupuestoObra.toLocaleString()}</p>
              </div>
              <div className="md:text-center">
                <p className="text-[9px] font-bold text-[#646e75] uppercase mb-2 tracking-widest">Ejecutado</p>
                <p className="text-3xl font-light text-[#474b54]">${metricas.totalGastado.toLocaleString()}</p>
              </div>
              <div className="md:text-right">
                <p className="text-[9px] font-bold text-[#646e75] uppercase mb-2 tracking-widest">Disponible</p>
                <p className={`text-3xl font-light ${metricas.balance < 0 ? 'text-red-700' : 'text-[#18202b]'}`}>
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