import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistroCliente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: ""
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmarPassword) {
      return setError("Las contraseñas no coinciden");
    }

    setCargando(true);
    try {
      const response = await fetch("http://localhost:3000/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.correo,
            password: formData.password,
            admin: 0
            })
      });

      if (response.ok) {
        navigate("/admin/usuarios"); 
      } else {
        const data = await response.json();
        setError(data.mensaje || "Error al crear la cuenta");
      }
    } catch{
      setError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3 block">Acceso Corporativo</span>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter italic">Nuevo Cliente</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">
            Cree una cuenta para la gestión de proyectos
          </p>
        </div>

        {/* TARJETA DE REGISTRO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* NOMBRE */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Nombre Completo</label>
              <input 
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            {/* CORREO */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Correo Electrónico</label>
              <input 
                type="email"
                name="correo"
                required
                value={formData.correo}
                onChange={handleChange}
                placeholder="cliente@empresa.com"
                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Contraseña</label>
              <input 
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            {/* CONFIRMAR PASSWORD */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Confirmar Contraseña</label>
              <input 
                type="password"
                name="confirmarPassword"
                required
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl text-center border border-red-100">
                ⚠️ {error}
              </div>
            )}

            {/* BOTÓN SUBMIT */}
            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {cargando ? "Registrando..." : "Crear Cuenta Cliente"}
            </button>
          </form>
        </div>

        {/* VOLVER */}
        <button 
          onClick={() => navigate("/cliente")}
          className="w-full mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
        >
          ← Cancelar y volver al panel
        </button>

      </div>
    </div>
  );
}