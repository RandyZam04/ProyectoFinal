import { useState } from "react";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:3000/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        id_cliente: form.id_cliente === "" ? null : Number(form.id_cliente)
      })
    });

    navigate("/admin/proyectos");
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Crear Proyecto</h2>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <input
          name="nombre"
          placeholder="Nombre"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="id_cliente"
          placeholder="ID Cliente"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          type="date"
          name="fecha_inicio"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          type="date"
          name="fecha_fin"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar
        </button>
      </form>

      <button
        onClick={() => navigate("/admin")}
        className="mt-4 text-blue-600 underline"
      >
        Volver al menú
      </button>
    </div>
  );
}
