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
    <div className="min-h-screen flex items-center justify-center bg-[#f4f0eb] p-6">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extralight text-[#18202b] tracking-[0.2em] mb-2">
            STUDIO <span className="font-medium">Z</span>
          </h1>
          <div className="h-px w-16 bg-[#18202b] mx-auto mb-4"></div>
          <p className="text-[10px] font-bold text-[#646e75] uppercase tracking-[0.4em]">
            Portal Corporativo
          </p>
        </div>

        <div className="bg-white p-12 border border-[#d4cbba] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="group">
              <label className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1 block">Usuario</label>
              <input
                type="email"
                placeholder="email@studioz.com"
                className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] px-4 py-3 text-sm font-medium text-[#18202b] focus:border-[#18202b] focus:bg-white transition-all outline-none rounded-none placeholder-[#dad8cc]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="group">
              <label className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1 block">Clave de Acceso</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#f9f8f6] border-b border-[#dad8cc] px-4 py-3 text-sm font-medium text-[#18202b] focus:border-[#18202b] focus:bg-white transition-all outline-none rounded-none placeholder-[#dad8cc]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={cargando}
              className="w-full bg-[#18202b] text-white py-4 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-[#474b54] transition-all disabled:opacity-50 rounded-none border border-[#18202b]"
            >
              {cargando ? "Validando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#f4f0eb] text-center">
            <button 
              onClick={() => navigate("/registro")}
              className="text-[#18202b] font-bold text-[9px] uppercase tracking-widest hover:underline decoration-[#d4cbba] transition-all"
            >
              Registro de Clientes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}