import { useState, useEffect, useRef } from "react";

export default function SeccionAvances({ idProyecto }) {
  const [posts, setPosts] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [form, setForm] = useState({ tipo: "avance", descripcion: "", monto: "", id_rubro: "" });
  
  // --- NUEVOS ESTADOS PARA ARCHIVOS ---
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/presupuestos/proyecto/${idProyecto}`)
      .then(res => res.json())
      .then(data => setRubros(data.rubros || []));
  }, [idProyecto]);

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoSeleccionado(file);
      // Opcional: Si es PDF cambiar tipo a 'plano' automáticamente
      if (file.type === "application/pdf") {
        setForm(prev => ({ ...prev, tipo: "plano" }));
      }
    }
  };

  const publicar = () => {
    if (!form.descripcion) return;
    const nuevoPost = { 
      ...form, 
      fecha: new Date().toLocaleDateString(),
      rubroNombre: rubros.find(r => r.idrubros == form.id_rubro)?.nombre,
      archivoNombre: archivoSeleccionado ? archivoSeleccionado.name : null // Referencia local
    };
    setPosts([nuevoPost, ...posts]); 
    setForm({ tipo: "avance", descripcion: "", monto: "", id_rubro: "" }); 
    setArchivoSeleccionado(null); // Limpiar adjunto
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* PUBLICADOR ESTILO TWITTER */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">AD</div>
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 resize-none text-gray-700"
            placeholder="¿Qué se hizo hoy en la obra?"
            rows="3"
            value={form.descripcion}
            onChange={e => setForm({...form, descripcion: e.target.value})}
          />
        </div>

        {/* PREVISUALIZACIÓN DE ADJUNTO */}
        {archivoSeleccionado && (
          <div className="mt-4 ml-16 p-3 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">{archivoSeleccionado.type.includes('image') ? '🖼️' : '📄'}</span>
              <p className="text-xs font-bold text-blue-700 truncate max-w-[250px] uppercase tracking-tighter">
                {archivoSeleccionado.name}
              </p>
            </div>
            <button 
              onClick={() => setArchivoSeleccionado(null)}
              className="w-8 h-8 flex items-center justify-center bg-white text-red-400 hover:text-red-600 rounded-full shadow-sm transition-colors font-black text-xs"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex gap-2 ml-14">
            {/* INPUT DE ARCHIVO OCULTO */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={manejarArchivo}
              className="hidden"
              accept="image/*,.pdf"
            />
            
            {/* BOTONES DE ADJUNTAR */}
            <button 
              onClick={() => fileInputRef.current.click()}
              className="p-2.5 hover:bg-blue-50 rounded-full transition-all group"
              title="Adjuntar imagen o plano"
            >
              <span className="text-xl group-hover:scale-110 block">📷</span>
            </button>

            {['avance', 'plano', 'render'].map(t => (
              <button 
                key={t}
                onClick={() => setForm({...form, tipo: t})}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${form.tipo === t ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select 
              className="text-[10px] font-black bg-gray-50 p-2 rounded-xl outline-none text-gray-500 uppercase border-none focus:ring-1 focus:ring-blue-200"
              value={form.id_rubro}
              onChange={e => setForm({...form, id_rubro: e.target.value})}
            >
              <option value="">¿Rubro?</option>
              {rubros.map(r => <option key={r.idrubros} value={r.idrubros}>{r.nombre}</option>)}
            </select>
            <input 
              type="number" placeholder="$ 0.00" 
              className="w-24 p-2 bg-gray-50 rounded-xl text-xs font-black outline-none border-none focus:ring-1 focus:ring-blue-200"
              value={form.monto}
              onChange={e => setForm({...form, monto: e.target.value})}
            />
            <button onClick={publicar} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200">
              Postear
            </button>
          </div>
        </div>
      </div>

      {/* FEED DE ACTIVIDAD */}
      <div className="space-y-6">
        {posts.map((post, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{post.tipo}</span>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">{post.fecha}</span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{post.descripcion}</p>
            
            {/* MOSTRAR NOMBRE DEL ARCHIVO EN EL POST */}
            {post.archivoNombre && (
              <div className="mt-4 flex items-center gap-2 text-blue-500 bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100">
                <span className="text-sm">📎</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">{post.archivoNombre}</span>
              </div>
            )}

            {post.monto && (
              <div className="mt-5 p-5 bg-blue-50 rounded-2xl flex justify-between items-center border border-blue-100">
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Gasto en rubro</p>
                  <p className="font-black text-blue-900">{post.rubroNombre}</p>
                </div>
                <p className="text-3xl font-black text-blue-600 tracking-tighter">${Number(post.monto).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}