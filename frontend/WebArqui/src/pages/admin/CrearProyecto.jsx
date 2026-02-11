import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CrearProyecto() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_cliente: "", 
    fecha_inicio: "",
    fecha_fin: "",
    estado: "1",
    id_responsable: "1"
  });

  const [usuarios, setUsuarios] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
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
    <div className="min-h-screen bg-[#f4f0eb] font-sans p-8 lg:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 border-b border-[#18202b] pb-6">
          <button 
            onClick={() => navigate("/admin/proyectos")}
            className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.3em] mb-4 hover:text-[#18202b]"
          >
            ← Cancelar
          </button>
          <h1 className="text-4xl font-light text-[#18202b] uppercase tracking-wide">Alta de Proyecto</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-12 border border-[#d4cbba] space-y-8">
          
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-widest">Nombre del Proyecto</label>
            <input
              required
              name="nombre"
              className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] p-4 text-sm text-[#18202b] focus:border-[#18202b] focus:bg-white outline-none rounded-none transition-all"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-widest">Descripción Técnica</label>
            <textarea
              name="descripcion"
              className="w-full bg-[#f9f8f6] border border-[#dad8cc] p-4 h-24 text-sm text-[#18202b] focus:border-[#18202b] focus:bg-white outline-none rounded-none resize-none"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-widest">Cliente Asignado</label>
            <select
              required
              name="id_cliente"
              className="w-full bg-[#f9f8f6] border border-[#dad8cc] p-4 text-sm text-[#18202b] focus:border-[#18202b] outline-none rounded-none appearance-none"
              onChange={handleChange}
              value={form.id_cliente}
            >
              <option value="">Selecciona un cliente de la base de datos...</option>
              {usuarios.map((u) => (
                <option key={u.idusuarios} value={u.idusuarios}>
                  {u.nombre} — ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-widest">Inicio de Obra</label>
              <input type="date" required name="fecha_inicio" className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] p-4 text-sm outline-none focus:border-[#18202b]" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-widest">Entrega Estimada</label>
              <input type="date" required name="fecha_fin" className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] p-4 text-sm outline-none focus:border-[#18202b]" onChange={handleChange} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#18202b] text-white rounded-none font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#474b54] transition-all border border-[#18202b]"
          >
            {loading ? "Procesando..." : "Registrar Obra"}
          </button>
        </form>
      </div>
    </div>
  );
}