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
    <div className="min-h-screen bg-[#f4f0eb] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-[#18202b] uppercase tracking-wide">Nuevo Cliente</h2>
          <div className="h-px w-12 bg-[#18202b] mx-auto mt-4 mb-2"></div>
          <p className="text-[#646e75] text-[9px] font-bold uppercase tracking-widest">
            Alta en Base de Datos
          </p>
        </div>

        <div className="bg-white p-12 border border-[#d4cbba] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="group">
              <label className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1 block">Nombre Completo</label>
              <input 
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] px-4 py-3 text-sm font-medium text-[#18202b] focus:border-[#18202b] focus:bg-white transition-all outline-none rounded-none placeholder-[#dad8cc]"
              />
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1 block">Correo Electrónico</label>
              <input 
                type="email"
                name="correo"
                required
                value={formData.correo}
                onChange={handleChange}
                placeholder="cliente@empresa.com"
                className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] px-4 py-3 text-sm font-medium text-[#18202b] focus:border-[#18202b] focus:bg-white transition-all outline-none rounded-none placeholder-[#dad8cc]"
              />
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1 block">Contraseña</label>
              <input 
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] px-4 py-3 text-sm font-medium text-[#18202b] focus:border-[#18202b] focus:bg-white transition-all outline-none rounded-none placeholder-[#dad8cc]"
              />
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1 block">Confirmar Contraseña</label>
              <input 
                type="password"
                name="confirmarPassword"
                required
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] px-4 py-3 text-sm font-medium text-[#18202b] focus:border-[#18202b] focus:bg-white transition-all outline-none rounded-none placeholder-[#dad8cc]"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest p-4 border border-red-100 text-center">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-[#18202b] text-white py-4 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#474b54] transition-all disabled:opacity-50 rounded-none border border-[#18202b]"
            >
              {cargando ? "Registrando..." : "Crear Cuenta"}
            </button>
          </form>
        </div>

        <button 
          onClick={() => navigate("/cliente")}
          className="w-full mt-8 text-[10px] font-bold text-[#bfb3a3] uppercase tracking-widest hover:text-[#18202b] transition-colors"
        >
          ← Cancelar
        </button>

      </div>
    </div>
  );
}