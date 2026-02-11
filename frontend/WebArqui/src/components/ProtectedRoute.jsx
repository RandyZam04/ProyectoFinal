import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

 const IP_AUTORIZADA = "190.15.139.231"; 

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [ipActual, setIpActual] = useState(null);
  const [cargando, setCargando] = useState(requireAdmin); 
  const user = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (requireAdmin) {
      const validarIP = async () => {
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          setIpActual(data.ip);
        } catch {
          setIpActual("error");
        } finally {
          setCargando(false);
        }
      };
      validarIP();
    }
  }, [requireAdmin]);

  if (!user) return <Navigate to="/" replace />;

  if (requireAdmin && cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4f0eb] text-[#18202b] font-bold text-xs uppercase tracking-[0.3em]">
        Verificando Credenciales...
      </div>
    );
  }

  if (requireAdmin && user.admin !== 1) {
    return <Navigate to="/cliente/proyectos" replace />;
  }

  if (requireAdmin && ipActual !== IP_AUTORIZADA) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4f0eb] p-4">
        <div className="bg-white p-12 border border-red-200 text-center max-w-md shadow-sm">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-xl font-light text-[#18202b] uppercase tracking-wide">Acceso Restringido</h1>
          <p className="text-[#646e75] mt-4 text-sm font-light">
            Ubicación no autorizada para gestión administrativa.
          </p>
          <div className="mt-8 p-3 bg-[#f9f8f6] font-mono text-[10px] text-[#bfb3a3] uppercase border border-[#dad8cc]">
            IP_DETECTADA: {ipActual}
          </div>
        </div>
      </div>
    );
  }

  return children;
};