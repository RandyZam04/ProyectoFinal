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

  // --- LÓGICA DE APERTURA CORREGIDA ---
  const abrirModal = (avance) => {
    // Ya no bloqueamos la apertura. Preparamos los adjuntos si existen.
    const adjuntosArray = avance.adjuntos_urls 
      ? avance.adjuntos_urls.split(',').map(url => ({
          url: url.trim(),
          tipo: esPdf(url.trim()) ? "application/pdf" : "image/jpeg"
        }))
      : [];

    const postParaModal = {
      ...avance,
      adjuntos: adjuntosArray
    };
    
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
    <div className="max-w-2xl mx-auto space-y-10 p-4 font-sans text-gray-900">
      
      {/* FORMULARIO */}
      <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border border-gray-100">
        <textarea 
          className="w-full p-5 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none font-medium text-gray-700 border-none"
          placeholder="¿Qué novedades hay hoy?"
          rows="3"
          value={form.descripcion}
          onChange={e => setForm({...form, descripcion: e.target.value})}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
           <div className="space-y-3">
              <select className="w-full bg-gray-50 p-3 rounded-2xl text-[11px] font-black uppercase text-gray-500 outline-none" value={form.id_rubro} onChange={e => setForm({...form, id_rubro: e.target.value})}>
                <option value="">Seleccionar Rubro</option>
                {rubros.map(r => <option key={r.idrubros} value={r.idrubros}>{r.nombre}</option>)}
              </select>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xs">$</span>
                <input type="number" placeholder="Monto" className="w-full bg-gray-50 p-3 pl-8 rounded-2xl text-xs font-bold outline-none" value={form.monto_gastado} onChange={e => setForm({...form, monto_gastado: e.target.value})} />
              </div>
           </div>
           <div className="bg-gray-50 p-4 rounded-3xl flex flex-col justify-center gap-2">
             <div className="flex justify-between px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase">Progreso</span>
                <span className="text-sm font-black text-blue-600">{form.porcentaje}%</span>
             </div>
             <input type="range" className="w-full accent-blue-600 h-1.5" min="0" max="100" value={form.porcentaje} onChange={e => setForm({...form, porcentaje: e.target.value})} />
           </div>
        </div>

        {/* PREVIEW DE ARCHIVOS */}
        {archivosSeleccionados.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 p-4 bg-blue-50/30 rounded-[2rem] border border-blue-50">
            {archivosSeleccionados.map((arch) => (
              <div key={arch.id} className="relative group w-20 h-20 bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100">
                {arch.preview ? <img src={arch.preview} className="w-full h-full object-cover" alt="prev" /> : <div className="w-full h-full flex items-center justify-center text-xl">📄</div>}
                <button onClick={() => setArchivosSeleccionados(prev => prev.filter(a => a.id !== arch.id))} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center">✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
          <div className="flex gap-3">
            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={manejarArchivos} />
            <button onClick={() => imageInputRef.current.click()} className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl">📷</button>
            <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" multiple onChange={manejarArchivos} />
            <button onClick={() => docInputRef.current.click()} className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-500 rounded-2xl">📎</button>
          </div>
          <button onClick={publicar} className="px-10 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg" disabled={enviando}>
            {enviando ? "Cargando..." : "Publicar"}
          </button>
        </div>
      </div>

      {/* FEED DE POSTS */}
      <div className="space-y-16">
        {Object.keys(postsAgrupados).map((fecha) => (
          <div key={fecha} className="space-y-8">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] text-center">{fecha}</h3>
            {postsAgrupados[fecha].map((post) => (
              <div key={post.idavances} className="bg-white p-7 rounded-[2.8rem] border border-gray-100 shadow-sm transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">{post.tipo}</span>
                  <span className="text-sm font-black text-blue-600">{post.porcentaje}%</span>
                </div>

                {/* AHORA FUNCIONA EL CLIC SIEMPRE */}
                <p className="text-gray-700 text-lg font-medium mb-6 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => abrirModal(post)}>
                  {post.descripcion}
                </p>

                {post.adjuntos_urls ? (
                  <div className="space-y-4">
                    {esImagen(post.adjuntos_urls.split(',')[0]) ? (
                      <div className="rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50 cursor-zoom-in group/img" onClick={() => abrirModal(post)}>
                        <img 
                          src={post.adjuntos_urls.split(',')[0]} 
                          className="w-full h-auto object-cover max-h-[400px] group-hover/img:scale-105 transition-transform duration-500" 
                          alt="Avance" 
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed cursor-pointer" onClick={() => abrirModal(post)}>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-blue-50">📄</div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-blue-900 uppercase tracking-tighter">Documento Adjunto</p>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Haga clic para ver detalles</p>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); manejarDescarga(post.adjuntos_urls); }}
                      className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                    >
                      Descargar Archivo Original ⬇️
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center cursor-pointer" onClick={() => abrirModal(post)}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sin adjuntos - Ver detalle</p>
                  </div>
                )}

                {/* Footer Costos */}
                {Number(post.monto_gastado) > 0 && (
                  <div className="mt-7 flex items-center justify-between p-5 bg-gray-50/70 rounded-[2rem] border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase">{post.rubroNombre}</span>
                    <span className="text-2xl font-black text-blue-600 tracking-tighter">${Number(post.monto_gastado).toLocaleString()}</span>
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

