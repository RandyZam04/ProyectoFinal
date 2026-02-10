import { useState, useEffect } from "react";
import ModalGaleria from "../admin/ModalGaleria"; 

export default function AvanceCliente({ idProyecto }) {
  const [avances, setAvances] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [ordenDesc, setOrdenDesc] = useState(true);
  const [cargando, setCargando] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchAvances = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/avances-cliente/proyecto/${idProyecto}`);
        const data = await res.json();
        setAvances(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando avances:", err);
      } finally {
        setCargando(false);
      }
    };
    if (idProyecto) fetchAvances();
  }, [idProyecto]);

  const abrirModal = (avance) => {
    const esArchivoPdf = avance.adjuntos_urls?.toLowerCase().includes(".pdf");
    
    const postParaModal = {
      ...avance,
      adjuntos: avance.adjuntos_urls ? [
        { 
          url: avance.adjuntos_urls, 
          tipo: esArchivoPdf ? "application/pdf" : "image/jpeg" 
        }
      ] : []
    };
    setSelectedPost(postParaModal);
    setModalOpen(true);
  };

  const manejarDescarga = (url) => {
    if (!url) return;
    const urlLimpia = url.replace("/fl_attachment/", "/");
    window.open(urlLimpia, "_blank", "noopener,noreferrer");
  };

  const avancesFiltrados = avances
    .filter(a => filtroTipo === "Todos" || a.tipo === filtroTipo)
    .sort((a, b) => {
      const fA = new Date(a.fecha);
      const fB = new Date(b.fecha);
      return ordenDesc ? fB - fA : fA - fB;
    });

  const esPdf = (url) => url?.toLowerCase().includes(".pdf");
  const esImagen = (url) => url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) && !esPdf(url);

  if (cargando) return (
    <div className="p-20 text-center">
      <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Sincronizando archivos...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      
      {/* NAVEGACIÓN DE FILTROS */}
      <div className="col-span-12 md:col-span-3 lg:col-span-2 sticky top-6 space-y-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-4">Filtros</p>
        {["Todos", "Avance", "Plano", "Render"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
              filtroTipo === tipo 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-500 hover:bg-white"
            }`}
          >
            {tipo === "Todos" ? "📂 Ver Todo" : `# ${tipo}`}
          </button>
        ))}
      </div>

      {/* FEED PRINCIPAL */}
      <div className="col-span-12 md:col-span-9 lg:col-span-7 space-y-6">
        {avancesFiltrados.length > 0 ? (
          avancesFiltrados.map((a) => (
            <div key={a.idavances} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 md:p-8">
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">🏗️</div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase italic">Reporte Oficial</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(a.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-gray-100 text-gray-500 rounded-full uppercase">
                    {a.tipo}
                  </span>
                </div>

                <p 
                  className="text-gray-600 text-base mb-6 font-medium leading-relaxed cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => abrirModal(a)}
                >
                  {a.descripcion}
                </p>

                {a.adjuntos_urls ? (
                  <div className="space-y-3">
                    {esImagen(a.adjuntos_urls) ? (
                      <div 
                        className="rounded-[1.5rem] overflow-hidden border border-gray-100 bg-gray-50 cursor-zoom-in group"
                        onClick={() => abrirModal(a)}
                      >
                        <img 
                          src={a.adjuntos_urls} 
                          className="w-full h-auto object-cover max-h-[400px] group-hover:scale-105 transition-transform duration-500" 
                          alt="Avance de obra" 
                        />
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => abrirModal(a)}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-blue-50">
                          📄
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-blue-900 uppercase tracking-tighter">Documento Técnico Adjunto</p>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                              Click para expandir detalles y comentarios
                          </p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => manejarDescarga(a.adjuntos_urls)}
                      className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                    >
                      <span>Descargar Original</span>
                      <span className="text-base">⬇️</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center cursor-pointer" onClick={() => abrirModal(a)}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Ver bitácora de texto</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-medium italic uppercase text-[10px] tracking-widest">Sin registros en esta categoría</p>
          </div>
        )}
      </div>

      {/* PANEL DERECHO INFORMATIVO */}
      <div className="hidden lg:block lg:col-span-3 sticky top-6">
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Interacción</p>
          <h3 className="text-lg font-black italic uppercase mb-4 leading-tight">Canal de Observaciones</h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-6">
            Ahora puedes dejar tus comentarios directamente en cada reporte de avance. Nuestro equipo técnico revisará tus inquietudes.
          </p>
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-30"></div>
        </div>
      </div>

      {/* MODAL GLOBAL */}
      {modalOpen && selectedPost && (
        <ModalGaleria 
          post={selectedPost} 
          initialImageIndex={0} 
          onClose={() => setModalOpen(false)} 
        />
      )}

    </div>
  );
}