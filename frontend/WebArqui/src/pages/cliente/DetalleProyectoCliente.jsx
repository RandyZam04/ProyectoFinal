import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AvanceCliente from "./AvancesCliente";

export default function DetalleProyectoCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState([]);
  const [tabActual, setTabActual] = useState("modulos");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/proyecto-individual/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setProyecto(data ? [data] : []);
      } catch (err) {
        console.error("Error de red:", err);
      }
    };
    if (id) cargarDatos();
  }, [id]);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Sin fecha";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => tabActual === "modulos" ? navigate("/cliente/proyectos") : setTabActual("modulos")} 
              className="group flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all"
            >
              {/* Icono dinámico con una pequeña animación */}
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                {tabActual === "modulos" ? (
                  <span className="text-gray-600 group-hover:text-blue-600 text-lg">←</span>
                ) : (
                  <span className="text-gray-600 group-hover:text-blue-600 text-base">🏠</span>
                )}
              </div>

              {/* Texto explicativo dinámico */}
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Regresar a
                </span>
                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-none">
                  {tabActual === "modulos" ? "Mis Proyectos" : "Menú Principal"}
                </span>
              </div>
            </button>
            {proyecto.map((p) => (
              <div key={p.idproyectos}>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">{p.nombre}</h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {tabActual === "modulos" ? "Panel de Control" : "Bitácora de Avances"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENIDO DINÁMICO */}
        {tabActual === "modulos" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Módulos Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setTabActual("avances")} 
                  className="group bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 hover:border-blue-500 transition-all text-left relative overflow-hidden"
                >
                  <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">📸</div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none mb-2">Bitácora de Avances</h3>
                  <p className="text-gray-400 text-sm font-medium">Fotos y reportes diarios.</p>
                </button>
                <button 
                  onClick={() => navigate(`/cliente/proyecto/${id}/presupuesto`)} 
                  className="group bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 hover:border-emerald-500 transition-all text-left relative overflow-hidden"
                >
                  <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">💰</div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none mb-2">Presupuesto y Costos</h3>
                  <p className="text-gray-400 text-sm font-medium">Control de inversión y pagos realizados.</p>
                </button>
              </div>
            </div>

            {/* BARRA LATERAL INFO */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Información de Obra</h3>
              {proyecto.map((p) => (
                <div key={`side-${p.idproyectos}`} className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Cronograma</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-[9px] text-blue-400 uppercase font-bold">Inicio</p>
                            <p className="text-sm font-bold italic">{formatearFecha(p.fecha_inicio)}</p>
                         </div>
                         <div>
                            <p className="text-[9px] text-red-400 uppercase font-bold">Fin</p>
                            <p className="text-sm font-bold italic">{formatearFecha(p.fecha_fin)}</p>
                         </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-4">Estado</p>
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full animate-pulse ${p.estado === 1 ? "bg-green-500" : "bg-yellow-500"}`}></span>
                        <span className="font-black text-xs uppercase tracking-widest">{p.estado === 1 ? "En Ejecución" : "Revisión"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* VISTA TWITTER FULL WIDTH */
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <AvanceCliente idProyecto={id} />
          </div>
        )}
      </div>
    </div>
  );
}