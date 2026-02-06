import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cliente() {
  const [proyectos, setProyectos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    
    if (!storedUser) {
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUser);

    fetch(`http://localhost:3000/api/proyectos/${user.id}/${user.admin}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProyectos(data);
        }
      })
      .catch(err => console.error("Error cargando proyectos del cliente:", err));
  }, [navigate]);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-8 uppercase tracking-tighter">Mis Proyectos</h1>

        {proyectos.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center">
            <p className="text-gray-500 font-medium">No tienes proyectos asignados actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proyectos.map(p => (
              <div key={p.idproyectos} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="font-black text-xl text-gray-900 leading-tight">{p.nombre}</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.estado === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.estado === 1 ? "Activo" : "Terminado"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6">{p.descripcion}</p>
                </div>

                {/* BOTÓN PARA VER DETALLES / PRESUPUESTO */}
                <button 
                  onClick={() => navigate(`/cliente/proyecto/${p.idproyectos}/presupuesto`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Ver Presupuesto y Detalles
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}