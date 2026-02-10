import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(data));

      if (data.admin === 1) {
        navigate("/admin");
      } else {
        navigate("/cliente/proyectos");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD] font-sans p-6">
      <div className="max-w-md w-full">
        
        {/* LOGO O TÍTULO */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-4 block">Portal Corporativo</span>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter italic">Acceso</h1>
        </div>

        {/* CARD DE LOGIN */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200/60 border border-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Email de Usuario</label>
              <input
                type="email"
                placeholder="nombre@empresa.com"
                className="w-full bg-gray-50 border border-transparent px-6 py-5 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-transparent px-6 py-5 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={cargando}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {cargando ? "Validando..." : "Entrar al Sistema"}
            </button>
          </form>

          {/* SECCIÓN DE REGISTRO */}
          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">¿No tienes una cuenta de cliente?</p>
            <button 
              onClick={() => navigate("/registro")} // Ajusta la ruta según tu App.js
              className="text-blue-600 font-black text-[11px] uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              Registrar nuevo cliente →
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Secure Access Management System v2.0
        </p>
      </div>
    </div>
  );
}