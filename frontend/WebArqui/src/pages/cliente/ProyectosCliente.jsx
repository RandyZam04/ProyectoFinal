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
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
              Panel de Propietario • {usuario?.nombre}
            </span>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mt-1">Mis Proyectos</h1>
          </div>
          
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="group bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm hover:bg-red-50 transition-all flex items-center gap-2"
          >
            <span className="text-[10px] font-black text-gray-400 group-hover:text-red-600 uppercase tracking-widest transition-colors">Cerrar Sesión</span>
            <span className="text-lg">🚪</span>
          </button>
        </div>

        {proyectos.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 text-center shadow-inner">
            <div className="text-6xl mb-6">🏗️</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 italic">No hay obras registradas</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proyectos.map((p) => (
              <div key={p.idproyectos} className="group bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 hover:border-blue-500 transition-all relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:rotate-12 transition-transform">🏠</div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.estado === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.estado === 1 ? "En Curso" : "Finalizado"}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-3 uppercase italic leading-none">{p.nombre}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium italic">{p.descripcion}</p>
                </div>
                <button 
                  onClick={() => navigate(`/cliente/proyecto/${p.idproyectos}`)}
                  className="w-full bg-gray-900 group-hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl relative z-10"
                >
                  Ver Panel del Proyecto <span className="group-hover:translate-x-2 transition-transform text-lg">→</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL DE SEGURIDAD */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">🔒</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 italic">Sesión Segura</h2>
              <p className="text-gray-400 text-sm mb-8">Por seguridad, debes confirmar si deseas abandonar el panel.</p>
              <div className="flex flex-col gap-3">
                <button onClick={cerrarSesion} className="bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100">Confirmar Salida</button>
                <button onClick={() => setShowLogoutModal(false)} className="bg-gray-100 text-gray-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Volver al Panel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}