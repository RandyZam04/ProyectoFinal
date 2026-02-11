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
      } catch (err) { console.error(err); }
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
    <div className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col lg:flex-row bg-[#18202b]/95 overflow-hidden font-sans">
      
      {/* IZQUIERDA: VISOR */}
      <div className="relative flex-1 flex items-center justify-center p-4 lg:p-12 bg-[#18202b]">
        <button onClick={onClose} className="absolute top-8 left-8 text-[#bfb3a3] hover:text-white text-2xl lg:hidden">✕</button>
        
        {imagenActual ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={imagenActual.url} 
              alt="Vista previa" 
              className="max-h-[85vh] max-w-full object-contain shadow-2xl" 
            />
            {imagenesDelPost.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-0 top-1/2 -translate-y-1/2 p-5 text-white text-4xl hover:bg-white/5 transition-all">‹</button>
                <button onClick={nextImage} className="absolute right-0 top-1/2 -translate-y-1/2 p-5 text-white text-4xl hover:bg-white/5 transition-all">›</button>
              </>
            )}
          </div>
        ) : pdfsDelPost.length > 0 ? (
          <div className="text-center p-12 border border-[#474b54]">
            <div className="text-7xl mb-6 text-[#bfb3a3]">📄</div>
            <h3 className="text-white font-bold text-xl uppercase tracking-widest">Documento Técnico</h3>
            <a 
              href={pdfsDelPost[0].url} 
              target="_blank" 
              rel="noreferrer"
              className="mt-8 px-8 py-4 bg-white text-[#18202b] font-bold text-xs uppercase tracking-widest inline-block hover:bg-[#d4cbba]"
            >
              Abrir PDF
            </a>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[#bfb3a3] font-bold uppercase tracking-[0.3em] text-[10px]">Detalle de Actualización</p>
          </div>
        )}
      </div>

      {/* DERECHA: SIDEBAR */}
      <div className="w-full lg:w-[450px] bg-[#f4f0eb] h-full shadow-2xl flex flex-col relative shrink-0 border-l border-[#d4cbba]">
        <div className="flex items-center justify-between p-8 border-b border-[#dad8cc]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#18202b] flex items-center justify-center text-white font-light text-xs">SZ</div>
            <div>
              <p className="text-lg font-light text-[#18202b] uppercase tracking-wide">Bitácora</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#18202b] hover:text-red-700 font-bold text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#18202b] text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">{post.tipo}</span>
              <span className="text-[10px] font-bold text-[#bfb3a3] uppercase">{new Date(post.fecha).toLocaleDateString()}</span>
            </div>
            <p className="text-[#474b54] text-lg leading-relaxed font-light">{post.descripcion}</p>
          </div>

          <div className="pt-8 border-t border-[#dad8cc]">
            <h5 className="text-[9px] font-bold text-[#18202b] uppercase tracking-[0.2em] mb-6">Comentarios</h5>
            <div className="space-y-6">
              {comentarios.length > 0 ? comentarios.map(com => (
                <div key={com.idcomentario} className="flex gap-4">
                  <div className="w-6 h-6 bg-[#dad8cc] flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-[#18202b]">
                    U{com.id_usuario}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#18202b] uppercase">Usuario {com.id_usuario}</span>
                      <span className="text-[9px] text-[#bfb3a3] font-bold uppercase">{new Date(com.fecha).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-[#474b54] font-light bg-white border border-[#dad8cc] p-3">
                      {com.contenido}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-[#bfb3a3] italic text-center py-4">Sin observaciones.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-[#dad8cc]">
          <form onSubmit={handleEnviarComentario} className="relative">
            <input 
              type="text"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribir observación..."
              className="w-full bg-[#f9f8f6] border border-[#dad8cc] py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-[#18202b] font-light rounded-none"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#18202b] hover:text-[#7d8b8d] px-2">
              ↑
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}