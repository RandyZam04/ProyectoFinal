import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cliente() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [usuario] = useState(() => {
    const storedUser = localStorage.getItem("usuario");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (!usuario) {
      navigate("/");
      return;
    }

    window.history.pushState(null, null, window.location.pathname);
    
    const manejarRetroceso = () => {
      setShowLogoutModal(true);
      window.history.pushState(null, null, window.location.pathname);
    };

    const cerrarAlSalir = () => {
      localStorage.removeItem("usuario");
    };

    window.addEventListener("popstate", manejarRetroceso);
    window.addEventListener("beforeunload", cerrarAlSalir);

    const cargarProyectos = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/proyectos/${usuario.id}/${usuario.admin}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProyectos(data);
        }
      } catch (err) {
        console.error("Error cargando proyectos del cliente:", err);
      }
    };

    cargarProyectos();

    return () => {
      window.removeEventListener("popstate", manejarRetroceso);
      window.removeEventListener("beforeunload", cerrarAlSalir);
    };
  }, [navigate, usuario]);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f4f0eb] font-sans p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-16 border-b border-[#d4cbba] pb-6">
          <div>
            <h1 className="text-4xl font-light text-[#18202b] uppercase tracking-wide">Bienvenido, {usuario?.nombre}</h1>
            <p className="text-[#646e75] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Área de Clientes</p>
          </div>
          
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="text-[10px] font-bold text-[#18202b] uppercase tracking-widest hover:text-red-700 transition-colors border-b border-transparent hover:border-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        {proyectos.length === 0 ? (
          <div className="p-20 border border-dashed border-[#d4cbba] text-center">
            <h3 className="text-xl font-light text-[#18202b] italic">No hay obras asignadas actualmente</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {proyectos.map((p) => (
              <div key={p.idproyectos} className="group bg-white p-10 border border-[#d4cbba] hover:border-[#18202b] transition-all flex flex-col justify-between h-[400px] shadow-sm hover:shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                   <span className="text-[80px] font-thin text-[#f4f0eb] group-hover:text-[#f9f8f6] transition-colors leading-none">0{p.idproyectos}</span>
                </div>
                
                <div className="relative z-10 mt-4">
                  <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${p.estado === 1 ? "border-[#18202b] text-[#18202b]" : "border-[#dad8cc] text-[#dad8cc]"}`}>
                    {p.estado === 1 ? "En Ejecución" : "Entregado"}
                  </span>
                  <h2 className="text-3xl font-light text-[#18202b] mt-6 mb-4 uppercase tracking-wide">{p.nombre}</h2>
                  <p className="text-[#646e75] text-sm font-light leading-relaxed line-clamp-3">{p.descripcion}</p>
                </div>

                <button 
                  onClick={() => navigate(`/cliente/proyecto/${p.idproyectos}`)}
                  className="mt-8 self-start text-[10px] font-bold text-[#18202b] uppercase tracking-[0.3em] border-b border-[#18202b] pb-1 hover:pb-2 transition-all"
                >
                  Acceder al Proyecto →
                </button>
              </div>
            ))}
          </div>
        )}

        {showLogoutModal && (
          <div className="fixed inset-0 bg-[#18202b]/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-[#f4f0eb] p-12 max-w-sm w-full border border-[#d4cbba] text-center shadow-2xl">
              <h2 className="text-lg font-light text-[#18202b] mb-6 uppercase tracking-widest">¿Desea Salir?</h2>
              <div className="flex flex-col gap-3">
                <button onClick={cerrarSesion} className="bg-[#18202b] text-white py-4 font-bold text-[10px] uppercase tracking-widest hover:bg-red-800 transition-all rounded-none">Sí, Salir</button>
                <button onClick={() => setShowLogoutModal(false)} className="bg-transparent border border-[#18202b] text-[#18202b] py-4 font-bold text-[10px] uppercase tracking-widest hover:bg-[#dad8cc] transition-all rounded-none">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}