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
    if (!fechaStr) return "S/F";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#f4f0eb] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12 border-b border-[#d4cbba] pb-8 flex justify-between items-end">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => tabActual === "modulos" ? navigate("/cliente/proyectos") : setTabActual("modulos")} 
              className="text-[10px] font-bold text-[#bfb3a3] uppercase tracking-[0.3em] hover:text-[#18202b] self-start"
            >
               ← {tabActual === "modulos" ? "Mis Proyectos" : "Menú Principal"}
            </button>
            {proyecto.map((p) => (
              <div key={p.idproyectos}>
                <h1 className="text-4xl md:text-5xl font-light text-[#18202b] uppercase tracking-wide">{p.nombre}</h1>
              </div>
            ))}
          </div>
          <div className="hidden md:block text-right">
             <p className="text-[9px] font-bold text-[#18202b] uppercase tracking-[0.3em]">Studio Z</p>
             <p className="text-[9px] text-[#7d8b8d] uppercase tracking-widest">Portal de Cliente</p>
          </div>
        </div>

        {tabActual === "modulos" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button 
                  onClick={() => setTabActual("avances")} 
                  className="group bg-white p-10 border border-[#d4cbba] hover:border-[#18202b] transition-all text-left h-64 flex flex-col justify-between shadow-sm hover:shadow-lg"
                >
                  <div className="text-4xl text-[#18202b] font-light">01</div>
                  <div>
                    <h3 className="text-2xl font-light text-[#18202b] uppercase mb-2 tracking-wide">Bitácora</h3>
                    <p className="text-[#646e75] text-xs font-medium uppercase tracking-widest">Reportes y Fotografías</p>
                  </div>
                </button>
                <button 
                  onClick={() => navigate(`/cliente/proyecto/${id}/presupuesto`)} 
                  className="group bg-[#18202b] p-10 border border-[#18202b] hover:bg-[#474b54] transition-all text-left h-64 flex flex-col justify-between shadow-sm hover:shadow-lg"
                >
                  <div className="text-4xl text-[#dad8cc] font-light">02</div>
                  <div>
                    <h3 className="text-2xl font-light text-white uppercase mb-2 tracking-wide">Finanzas</h3>
                    <p className="text-[#dad8cc] text-xs font-medium uppercase tracking-widest">Estado de Cuenta</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#d4cbba] p-10 h-fit">
              <h3 className="text-[10px] font-bold text-[#18202b] uppercase tracking-[0.3em] mb-8 border-b border-[#dad8cc] pb-2">Ficha Técnica</h3>
              {proyecto.map((p) => (
                <div key={`side-${p.idproyectos}`} className="space-y-8">
                  <div>
                    <p className="text-[9px] text-[#bfb3a3] uppercase font-bold tracking-widest mb-1">Periodo</p>
                    <p className="text-sm font-medium text-[#18202b]">{formatearFecha(p.fecha_inicio)} — {formatearFecha(p.fecha_fin)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#bfb3a3] uppercase font-bold tracking-widest mb-1">Estatus</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.estado === 1 ? "bg-[#18202b]" : "bg-[#d4cbba]"}`}></span>
                      <span className="font-bold text-xs uppercase tracking-widest text-[#18202b]">{p.estado === 1 ? "En Obra" : "Finalizado"}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#dad8cc]">
                      <p className="text-xs text-[#646e75] italic leading-relaxed">"{p.descripcion}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
             <AvanceCliente idProyecto={id} />
          </div>
        )}
      </div>
    </div>
  );
}