import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ListaProyectosAdmin() {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      navigate("/");
      return;
    }
    const user = JSON.parse(storedUser);

    const cargarProyectos = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/proyectos/${user.id}/${user.admin}?t=${Date.now()}`
        );
        if (!response.ok) throw new Error("Error en servidor");
        const data = await response.json();
        setProyectos(data);
      } catch (err) {
        console.error("Error al obtener proyectos:", err);
      }
    };
    cargarProyectos();
  }, [navigate]);

  const proyectosFiltrados = proyectos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.cliente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 px-4">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2 block">Management Center</span>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter italic">Proyectos</h2>
          </div>
          
          <div className="w-full md:w-72 relative">
            <input 
              type="text"
              placeholder="Buscar obra o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-gray-100 px-6 py-4 rounded-2xl text-xs font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>
        </div>

        {/* LISTADO */}
        {proyectosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm px-10">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest leading-loose">
              No se encontraron registros activos<br/>en la base de datos central.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {proyectosFiltrados.map((p) => (
              <Link 
                to={`/admin/proyectos/${p.idproyectos}`} 
                key={p.idproyectos} 
                className="group relative"
              >
                <div className="bg-white p-8 rounded-[2.8rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  
                  {/* Decoración lateral de color */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${p.estado === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${
                        p.estado === 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.estado === 1 ? "En Ejecución" : "Finalizado"}
                      </span>
                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">ID: #{p.idproyectos}</span>
                    </div>

                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 group-hover:text-blue-600 transition-colors uppercase italic">
                      {p.nombre}
                    </h3>
                    
                    <p className="text-gray-400 text-sm font-medium line-clamp-1 max-w-xl italic">
                      {p.descripcion || "Sin descripción detallada disponible."}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end justify-center gap-4 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-8">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Inversionista</p>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">{p.cliente || "Externo"}</p>
                      </div>
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs font-black uppercase">
                        {(p.cliente || "C").charAt(0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Gestionar Archivos <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* BOTÓN VOLVER */}
        <div className="flex justify-center mt-16">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-4 bg-white border border-gray-100 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
          >
            <span className="text-lg">←</span> Volver al Sistema
          </button>
        </div>
      </div>
    </div>
  );
}