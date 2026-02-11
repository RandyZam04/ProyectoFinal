import { useState, useEffect, useRef, useCallback } from "react";
import ModalGaleria from "../admin/ModalGaleria"; 

export default function SeccionAvances({ idProyecto }) {
  const [posts, setPosts] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [enviando, setEnviando] = useState(false);
  
  const [form, setForm] = useState({ 
    tipo: "Avance", descripcion: "", monto_gastado: "", id_rubro: "", porcentaje: 0 
  });
  
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const esPdf = (url) => url?.toLowerCase().includes(".pdf");
  const esImagen = (url) => url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) && !esPdf(url);

  const cargarTodo = useCallback(async () => {
    if (!idProyecto) return;
    try {
      const resRubros = await fetch(`http://localhost:3000/api/presupuestos/proyecto/${idProyecto}`);
      const dataRubros = await resRubros.json();
      const listaRubros = dataRubros.rubros || [];
      setRubros(listaRubros);

      const resAvances = await fetch(`http://localhost:3000/api/seccion-avances/${idProyecto}`);
      const dataAvances = await resAvances.json();
      
      if (Array.isArray(dataAvances)) {
        const formateados = dataAvances.map(av => ({
          ...av,
          rubroNombre: listaRubros.find(r => r.idrubros == av.id_rubro)?.nombre || "General"
        }));
        setPosts(formateados); 
      }
    } catch (error) { console.error(error); }
  }, [idProyecto]);

  useEffect(() => { cargarTodo(); }, [cargarTodo]);

  const abrirModal = (avance) => {
    const adjuntosArray = avance.adjuntos_urls 
      ? avance.adjuntos_urls.split(',').map(url => ({
          url: url.trim(),
          tipo: esPdf(url.trim()) ? "application/pdf" : "image/jpeg"
        }))
      : [];
    const postParaModal = { ...avance, adjuntos: adjuntosArray };
    setSelectedPost(postParaModal);
    setModalOpen(true);
  };

  const manejarDescarga = (url) => {
    if (!url) return;
    window.open(url.split(',')[0].replace("/fl_attachment/", "/"), "_blank", "noopener,noreferrer");
  };

  const manejarArchivos = (e) => {
    const files = Array.from(e.target.files).map(f => ({ 
      id: Math.random().toString(36).substr(2, 9),
      file: f, 
      nombre: f.name,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null 
    }));
    setArchivosSeleccionados(prev => [...prev, ...files]);
  };

  const publicar = async () => {
    if (enviando) return;
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("descripcion", form.descripcion);
      formData.append("monto", form.monto_gastado || 0);
      formData.append("id_rubro", form.id_rubro);
      formData.append("id_proyecto", idProyecto); 
      formData.append("tipo", form.tipo);
      formData.append("porcentaje", form.porcentaje);
      archivosSeleccionados.forEach(adj => formData.append("files", adj.file));

      const res = await fetch("http://localhost:3000/api/publicar-avance", { method: "POST", body: formData });
      if (res.ok) {
        setForm({ tipo: "Avance", descripcion: "", monto_gastado: "", id_rubro: "", porcentaje: 0 });
        setArchivosSeleccionados([]);
        await cargarTodo();
      }
    } catch (error) { console.error(error); } finally { setEnviando(false); }
  };

  const postsAgrupados = posts.reduce((grupos, post) => {
    const fecha = new Date(post.fecha).toLocaleDateString('es-ES');
    if (!grupos[fecha]) grupos[fecha] = [];
    grupos[fecha].push(post);
    return grupos;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-12 p-4 font-sans text-[#18202b]">
      
      {/* FORMULARIO */}
      <div className="bg-white p-8 border border-[#d4cbba] shadow-sm">
        <textarea 
          className="w-full p-4 bg-[#f9f8f6] border border-[#dad8cc] outline-none font-light text-[#18202b] text-sm resize-none rounded-none focus:border-[#18202b] transition-colors"
          placeholder="Descripción del reporte técnico..."
          rows="3"
          value={form.descripcion}
          onChange={e => setForm({...form, descripcion: e.target.value})}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
           <div className="space-y-4">
              <select className="w-full bg-white border border-[#dad8cc] p-3 text-[10px] font-bold uppercase text-[#646e75] outline-none rounded-none" value={form.id_rubro} onChange={e => setForm({...form, id_rubro: e.target.value})}>
                <option value="">Categoría Relacionada</option>
                {rubros.map(r => <option key={r.idrubros} value={r.idrubros}>{r.nombre}</option>)}
              </select>
              <div className="relative border border-[#dad8cc]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-light text-[#bfb3a3]">$</span>
                <input type="number" placeholder="Inversión (Opcional)" className="w-full bg-transparent p-3 pl-8 text-xs font-medium outline-none" value={form.monto_gastado} onChange={e => setForm({...form, monto_gastado: e.target.value})} />
              </div>
           </div>
           <div className="border border-[#dad8cc] p-4 flex flex-col justify-center gap-2">
             <div className="flex justify-between px-1">
                <span className="text-[9px] font-bold text-[#bfb3a3] uppercase">Avance Físico</span>
                <span className="text-sm font-bold text-[#18202b]">{form.porcentaje}%</span>
             </div>
             <input type="range" className="w-full h-1 bg-[#dad8cc] accent-[#18202b]" min="0" max="100" value={form.porcentaje} onChange={e => setForm({...form, porcentaje: e.target.value})} />
           </div>
        </div>

        {/* PREVIEW */}
        {archivosSeleccionados.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 p-4 bg-[#f9f8f6] border border-[#dad8cc]">
            {archivosSeleccionados.map((arch) => (
              <div key={arch.id} className="relative group w-16 h-16 bg-white border border-[#dad8cc]">
                {arch.preview ? <img src={arch.preview} className="w-full h-full object-cover" alt="prev" /> : <div className="w-full h-full flex items-center justify-center text-xl">📄</div>}
                <button onClick={() => setArchivosSeleccionados(prev => prev.filter(a => a.id !== arch.id))} className="absolute -top-2 -right-2 bg-[#18202b] text-white w-4 h-4 text-[9px] flex items-center justify-center rounded-none">✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#f4f0eb]">
          <div className="flex gap-2">
            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={manejarArchivos} />
            <button onClick={() => imageInputRef.current.click()} className="px-4 py-2 border border-[#dad8cc] text-[#646e75] hover:border-[#18202b] hover:text-[#18202b] transition-all text-xs">FOTO</button>
            <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" multiple onChange={manejarArchivos} />
            <button onClick={() => docInputRef.current.click()} className="px-4 py-2 border border-[#dad8cc] text-[#646e75] hover:border-[#18202b] hover:text-[#18202b] transition-all text-xs">DOC</button>
          </div>
          <button onClick={publicar} className="px-8 py-3 bg-[#18202b] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#474b54] transition-all rounded-none" disabled={enviando}>
            {enviando ? "..." : "Publicar"}
          </button>
        </div>
      </div>

      {/* FEED */}
      <div className="space-y-16">
        {Object.keys(postsAgrupados).map((fecha) => (
          <div key={fecha} className="space-y-8 relative">
            <div className="sticky top-0 bg-[#f4f0eb] z-10 py-2 text-center border-b border-[#18202b]">
                <h3 className="text-[10px] font-bold text-[#18202b] uppercase tracking-[0.4em]">{fecha}</h3>
            </div>
            
            {postsAgrupados[fecha].map((post) => (
              <div key={post.idavances} className="bg-white p-8 border border-[#d4cbba] transition-all hover:shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 border border-[#18202b] text-[#18202b] text-[9px] font-bold uppercase tracking-widest">{post.tipo}</span>
                  <span className="text-sm font-light text-[#18202b]">{post.porcentaje}% Completado</span>
                </div>

                <p className="text-[#474b54] text-base font-light mb-6 leading-relaxed cursor-pointer hover:text-[#18202b]" onClick={() => abrirModal(post)}>
                  {post.descripcion}
                </p>

                {post.adjuntos_urls ? (
                  <div className="space-y-4">
                    {esImagen(post.adjuntos_urls.split(',')[0]) ? (
                      <div className="overflow-hidden border border-[#dad8cc] bg-[#f9f8f6] cursor-zoom-in" onClick={() => abrirModal(post)}>
                        <img src={post.adjuntos_urls.split(',')[0]} className="w-full h-auto object-cover max-h-[500px] grayscale hover:grayscale-0 transition-all duration-700" alt="Avance" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-6 bg-[#f9f8f6] border border-[#dad8cc] cursor-pointer hover:bg-[#dad8cc]/30" onClick={() => abrirModal(post)}>
                        <div className="text-2xl">📄</div>
                        <div>
                          <p className="text-xs font-bold text-[#18202b] uppercase">Archivo Técnico</p>
                          <p className="text-[9px] text-[#7d8b8d] uppercase tracking-widest mt-1">Ver documento</p>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); manejarDescarga(post.adjuntos_urls); }}
                      className="w-full flex items-center justify-center gap-2 border border-[#18202b] text-[#18202b] hover:bg-[#18202b] hover:text-white py-3 font-bold text-[9px] uppercase tracking-[0.2em] transition-all rounded-none"
                    >
                      Descargar Fuente
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-[#f9f8f6] border border-dashed border-[#dad8cc] text-center cursor-pointer" onClick={() => abrirModal(post)}>
                    <p className="text-[9px] text-[#bfb3a3] uppercase tracking-widest">Ver detalle en bitácora</p>
                  </div>
                )}

                {Number(post.monto_gastado) > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#f4f0eb] flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#bfb3a3] uppercase">{post.rubroNombre}</span>
                    <span className="text-lg font-light text-[#18202b]">${Number(post.monto_gastado).toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {modalOpen && selectedPost && (
        <ModalGaleria post={selectedPost} initialImageIndex={0} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}