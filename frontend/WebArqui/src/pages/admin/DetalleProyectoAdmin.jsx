import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Importamos los submódulos que viven en la misma carpeta
import SeccionPresupuesto from "./SeccionPresupuesto"; 
import SeccionAvances from "./SeccionAvances";

export default function DetalleProyectoAdmin() {
  const { id } = useParams();
  const [tabActual, setTabActual] = useState("resumen");
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/proyectos_detalle/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProyecto(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar el proyecto:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10 text-center font-bold">Cargando cerebro de la obra...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEAD*/}
      <div className="bg-white border-b border-gray-200 pt-12 pb-1">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Panel de Control</span>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter mt-1">
                {proyecto?.nombre || "Proyecto"}
              </h1>
              <p className="text-gray-400 mt-2 text-lg">{proyecto?.descripcion}</p>
            </div>
            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-right">Estado Actual</p>
              <p className="font-black text-blue-700 text-xl italic">En Construcción</p>
            </div>
          </div>
          
          {/* MENÚ DE NAVEGACIÓN */}
          <div className="flex gap-10">
            {["resumen", "presupuesto", "avances"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActual(tab)}
                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                  tabActual === tab 
                  ? "text-blue-700" 
                  : "text-gray-300 hover:text-gray-500"
                }`}
              >
                {tab}
                {tabActual === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-700 rounded-t-full shadow-[0_-2px_10px_rgba(29,78,216,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Division del as pestañas*/}
      <div className="max-w-6xl mx-auto p-8">
        
        {/* PESTAÑA: RESUMEN*/}
        {tabActual === "resumen" && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Eficiencia Semanal</p>
                <p className="text-5xl font-black text-gray-900">0%</p>
                <p className="text-xs text-blue-500 font-bold mt-2">Listo para registrar avances</p>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Días en Obra</p>
                <p className="text-5xl font-black text-gray-900">1</p>
                <p className="text-xs text-gray-400 font-bold mt-2">Desde la creación</p>
              </div>
              <div className="md:col-span-1 bg-blue-700 p-10 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-4">Alerta de Seguridad</p>
                <p className="text-xl font-bold leading-tight">Recuerda subir las fotos diarias para el cliente.</p>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: PRESUPUESTO*/}
        {tabActual === "presupuesto" && (
          <div className="animate-fadeIn">
            <SeccionPresupuesto idProyecto={id} />
          </div>
        )}

        {/* PESTAÑA: AVANCES */}
        {tabActual === "avances" && (
          <div className="animate-fadeIn">
            <SeccionAvances idProyecto={id} />
          </div>
        )}

      </div>
    </div>
  );
}