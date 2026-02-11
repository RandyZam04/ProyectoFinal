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
    <div className="min-h-screen bg-[#f4f0eb] p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-[#d4cbba] pb-6">
          <div>
            <span className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.3em] mb-2 block">Base de Datos</span>
            <h2 className="text-4xl font-light text-[#18202b] uppercase tracking-wide">Proyectos</h2>
          </div>
          
          <div className="w-full md:w-80">
            <input 
              type="text"
              placeholder="BUSCAR REFERENCIA..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-transparent border-b border-[#18202b] py-2 text-xs font-bold text-[#18202b] placeholder-[#d4cbba] focus:outline-none uppercase tracking-widest"
            />
          </div>
        </div>

        {proyectosFiltrados.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#d4cbba] bg-[#f9f8f6]">
            <p className="text-[#bfb3a3] font-bold text-[10px] uppercase tracking-widest">
              Sin registros disponibles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proyectosFiltrados.map((p) => (
              <Link 
                to={`/admin/proyectos/${p.idproyectos}`} 
                key={p.idproyectos} 
                className="group block"
              >
                <div className="bg-white border border-[#d4cbba] p-8 hover:border-[#18202b] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-[9px] font-bold tracking-widest uppercase border ${p.estado === 1 ? 'border-[#18202b] text-[#18202b]' : 'border-[#d4cbba] text-[#d4cbba]'}`}>
                        {p.estado === 1 ? "En Ejecución" : "Finalizado"}
                      </span>
                      <span className="text-[9px] text-[#bfb3a3] font-bold uppercase tracking-widest">ID: {p.idproyectos}</span>
                    </div>

                    <h3 className="text-2xl font-light text-[#18202b] mb-1 uppercase tracking-wide group-hover:pl-2 transition-all duration-500">
                      {p.nombre}
                    </h3>
                    
                    <p className="text-[#646e75] text-xs font-medium max-w-xl truncate">
                      {p.descripcion || "Especificaciones no detalladas."}
                    </p>
                  </div>

                  <div className="text-right border-l border-[#d4cbba] pl-8 hidden md:block">
                    <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-sm font-bold text-[#18202b] uppercase">{p.cliente || "Externo"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-16">
          <button
            onClick={() => navigate("/admin")}
            className="text-[10px] font-bold text-[#18202b] uppercase tracking-[0.3em] hover:underline decoration-[#d4cbba]"
          >
            ← Volver al Panel
          </button>
        </div>
      </div>
    </div>
  );
}