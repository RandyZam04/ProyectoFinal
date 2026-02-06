import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Administrador</h1>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/admin/proyectos")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ver proyectos
        </button>

        <button
          onClick={() => navigate("/admin/proyectos/crear")}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear proyecto
        </button>
      </div>
    </div>
  );
}
