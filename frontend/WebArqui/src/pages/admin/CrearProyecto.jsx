import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CrearProyecto() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_cliente: "", // Aquí guardaremos el idusuarios seleccionado
    fecha_inicio: "",
    fecha_fin: "",
    estado: "1",
    id_responsable: "1"
  });

  const [usuarios, setUsuarios] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cambiamos a tu endpoint de usuarios
    fetch("http://localhost:3000/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        // Filtramos solo los que NO son admin (admin === 0)
        const soloClientes = data.filter(u => u.admin === 0);
        setUsuarios(soloClientes);
      })
      .catch((err) => console.error("Error cargando usuarios:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("http://localhost:3000/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Aseguramos que se envíe como número para la DB
          id_cliente: form.id_cliente === "" ? null : Number(form.id_cliente)
        })
      });
      navigate("/admin/proyectos");
    } catch (error) {
      console.error("Error al crear proyecto:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <button 
            onClick={() => navigate("/admin/proyectos")}
            className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2 hover:underline"
          >
            ← Volver a la lista
          </button>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Nuevo Proyecto</h1>
          <p className="text-gray-400 mt-2 text-lg italic">Asigna un cliente de tu base de datos.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 space-y-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nombre</label>
            <input
              required
              name="nombre"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-600 outline-none"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Descripción</label>
            <textarea
              name="descripcion"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 h-24 focus:ring-2 focus:ring-blue-600 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Selector con los datos de tu tabla 'usuarios' */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Cliente (Usuarios Finales)</label>
            <select
              required
              name="id_cliente"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
              onChange={handleChange}
              value={form.id_cliente}
            >
              <option value="">Selecciona un cliente...</option>
              {usuarios.map((u) => (
                <option key={u.idusuarios} value={u.idusuarios}>
                  {u.nombre} — ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Inicio</label>
              <input type="date" required name="fecha_inicio" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-600" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Fin</label>
              <input type="date" required name="fecha_fin" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-600" onChange={handleChange} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl disabled:bg-gray-300"
          >
            {loading ? "Procesando..." : "Crear Proyecto"}
          </button>
        </form>
      </div>
    </div>
  );
}