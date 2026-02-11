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

  if (cargando) return <div className="p-20 text-center text-xs font-bold text-[#bfb3a3] uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="grid grid-cols-12 gap-12 items-start">
      
      <div className="col-span-12 md:col-span-3 sticky top-6">
        <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.2em] mb-4 border-b border-[#d4cbba] pb-2">Filtros</p>
        <div className="space-y-1">
          {["Todos", "Avance", "Plano", "Render"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`w-full text-left px-4 py-3 font-bold text-xs uppercase tracking-widest transition-all ${
                filtroTipo === tipo 
                  ? "bg-[#18202b] text-white" 
                  : "text-[#646e75] hover:bg-white"
              }`}
            >
              {tipo === "Todos" ? "Ver Todo" : `# ${tipo}`}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-12 md:col-span-9 space-y-12">
        {avancesFiltrados.length > 0 ? (
          avancesFiltrados.map((a) => (
            <div key={a.idavances} className="bg-white border border-[#d4cbba] hover:border-[#18202b] transition-all">
              <div className="p-8 md:p-12">
                
                <div className="flex items-start justify-between mb-8 border-b border-[#f4f0eb] pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#18202b] flex items-center justify-center text-white text-xs font-light">SZ</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#18202b] uppercase tracking-widest">Reporte Oficial</h4>
                      <p className="text-[9px] text-[#bfb3a3] font-bold uppercase tracking-widest">
                        {new Date(a.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-1 border border-[#d4cbba] text-[#646e75] uppercase">
                    {a.tipo}
                  </span>
                </div>

                <p 
                  className="text-[#474b54] text-lg font-light mb-8 leading-relaxed cursor-pointer hover:text-[#18202b]"
                  onClick={() => abrirModal(a)}
                >
                  {a.descripcion}
                </p>

                {a.adjuntos_urls ? (
                  <div className="space-y-4">
                    {esImagen(a.adjuntos_urls) ? (
                      <div 
                        className="overflow-hidden border border-[#d4cbba] bg-[#f9f8f6] cursor-zoom-in grayscale hover:grayscale-0 transition-all duration-700"
                        onClick={() => abrirModal(a)}
                      >
                        <img 
                          src={a.adjuntos_urls} 
                          className="w-full h-auto object-cover max-h-[600px]" 
                          alt="Avance de obra" 
                        />
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-4 p-6 bg-[#f9f8f6] border border-[#d4cbba] cursor-pointer hover:bg-[#dad8cc]/50"
                        onClick={() => abrirModal(a)}
                      >
                        <div className="text-2xl">📄</div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[#18202b] uppercase tracking-widest">Documento Técnico</p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => manejarDescarga(a.adjuntos_urls)}
                      className="w-full flex items-center justify-center gap-2 bg-[#18202b] text-white py-4 font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#474b54] transition-all"
                    >
                      Descargar Original
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-[#f9f8f6] border border-dashed border-[#d4cbba] text-center cursor-pointer" onClick={() => abrirModal(a)}>
                    <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest">Ver bitácora de texto</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center border border-dashed border-[#d4cbba]">
            <p className="text-[#bfb3a3] font-bold uppercase text-[10px] tracking-widest">Sin registros</p>
          </div>
        )}
      </div>

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