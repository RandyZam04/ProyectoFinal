import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function ModalGaleria({ post, initialImageIndex, onClose }) {
  const imagenesDelPost = (post.adjuntos || []).filter(adj => 
    adj.tipo && adj.tipo.startsWith('image/')
  );
  
  const pdfsDelPost = (post.adjuntos || []).filter(adj => 
    adj.tipo && adj.tipo.includes('pdf')
  );

  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const imagenActual = imagenesDelPost[currentIndex];

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/comentarios/avance/${post.idavances}`);
        if (res.ok) {
          const data = await res.json();
          setComentarios(data);
        }
      } catch (err) { console.error("Error cargando comentarios:", err); }
    };
    if (post.idavances) fetchComentarios();
  }, [post.idavances]);

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || enviando) return;
    setEnviando(true);
    try {
      const res = await fetch("http://localhost:3000/api/comentarios/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proyecto: post.id_proyecto,
          id_avance: post.idavances,
          id_usuario: 2, 
          contenido: nuevoComentario
        })
      });
      if (res.ok) {
        const data = await res.json();
        setComentarios([{ idcomentario: data.idcomentario, id_usuario: 2, contenido: nuevoComentario, fecha: new Date().toISOString() }, ...comentarios]);
        setNuevoComentario("");
      }
    } catch (error) { console.error(error); } finally { setEnviando(false); }
  };

  const nextImage = useCallback(() => {
    if (imagenesDelPost.length > 0) setCurrentIndex((prevIndex) => (prevIndex + 1) % imagenesDelPost.length);
  }, [imagenesDelPost.length]);

  const prevImage = useCallback(() => {
    if (imagenesDelPost.length > 0) setCurrentIndex((prevIndex) => (prevIndex - 1 + imagenesDelPost.length) % imagenesDelPost.length);
  }, [imagenesDelPost.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, nextImage, prevImage]);

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col lg:flex-row bg-black/60 backdrop-blur-xl animate-fadeIn overflow-hidden font-sans">
      
      {/* SECCIÓN IZQUIERDA: VISOR DINÁMICO */}
      <div className="relative flex-1 flex items-center justify-center p-4 lg:p-12">
        <button onClick={onClose} className="absolute top-8 left-8 z-[10000] text-white/50 hover:text-white text-4xl lg:hidden">✕</button>
        
        {imagenActual ? (
          /* CASO 1: HAY IMÁGENES */
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={imagenActual.url} 
              alt="Vista previa" 
              className="max-h-[85vh] max-w-full object-contain drop-shadow-2xl rounded-lg" 
            />
            {imagenesDelPost.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-5 rounded-full text-white text-4xl border border-white/10 transition-all">‹</button>
                <button onClick={nextImage} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-5 rounded-full text-white text-4xl border border-white/10 transition-all">›</button>
              </>
            )}
          </div>
        ) : pdfsDelPost.length > 0 ? (
          /* CASO 2: NO HAY IMAGEN PERO HAY PDF */
          <div className="text-center p-12 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-md">
            <div className="text-7xl mb-6">📄</div>
            <h3 className="text-white font-black text-xl uppercase tracking-widest">Documento Técnico</h3>
            <p className="text-white/40 text-sm mt-2 mb-8">Este archivo debe descargarse para su visualización</p>
            <a 
              href={pdfsDelPost[0].url} 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all inline-block"
            >
              Abrir PDF Original
            </a>
          </div>
        ) : (
          /* CASO 3: SÓLO TEXTO */
          <div className="text-center">
            <div className="text-6xl opacity-20 mb-4 text-white">📝</div>
            <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">Detalle de Actualización</p>
          </div>
        )}
      </div>

      {/* SECCIÓN DERECHA: SIDEBAR (Se mantiene igual pero con mejoras de scroll) */}
      <div className="w-full lg:w-[450px] bg-white h-full shadow-2xl flex flex-col relative shrink-0">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-lg">AD</div>
            <div>
              <p className="text-lg font-black text-gray-900 leading-none">Admin Proyecto</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Bitácora de Obra</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 transition-all">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{post.tipo}</span>
              <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(post.fecha).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-700 text-xl leading-relaxed font-medium">{post.descripcion}</p>
          </div>

          <div className="pt-8 border-t border-gray-50">
            <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Comentarios</h5>
            <div className="space-y-6">
              {comentarios.length > 0 ? comentarios.map(com => (
                <div key={com.idcomentario} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                    U{com.id_usuario}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-gray-800">Usuario {com.id_usuario}</span>
                      <span className="text-[9px] text-gray-300 font-bold uppercase">{new Date(com.fecha).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 leading-relaxed">
                      {com.contenido}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-400 italic text-center py-10">Sin observaciones para este avance.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <form onSubmit={handleEnviarComentario} className="relative">
            <input 
              type="text"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribir observación..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
              ↑
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
