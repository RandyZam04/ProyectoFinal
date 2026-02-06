import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Añadimos Link

export default function ListaProyectosAdmin() {
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
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando proyectos");
        return res.json();
      })
      .then((data) => setProyectos(data))
      .catch((err) => console.error("Error:", err));
  }, [navigate]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Panel de Proyectos</h2>

      {proyectos.length === 0 ? (
        <p className="text-gray-500 italic">No hay proyectos asignados.</p>
      ) : (
        <div className="grid gap-4">
          {proyectos.map((p) => (
            /* Envolvemos la tarjeta con Link hacia la ruta de detalle */
            <Link to={`/admin/proyectos/${p.idproyectos}`} key={p.idproyectos} className="no-underline">
              <div className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-blue-800">{p.nombre}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {p.estado === 1 ? "ACTIVO" : "TERMINADO"}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{p.descripcion}</p>
                <p className="text-sm text-gray-400 mt-3 font-medium uppercase">Cliente: {p.cliente}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate("/admin")}
        className="mt-8 inline-block bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-semibold transition-colors"
      >
        ← Volver al menú
      </button>
    </div>
  );
}