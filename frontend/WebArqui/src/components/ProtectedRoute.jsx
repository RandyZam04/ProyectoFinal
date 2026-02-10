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
      <div className="flex items-center justify-center h-screen font-black text-blue-600 animate-pulse">
        VERIFICANDO ENTORNO SEGURO...
      </div>
    );
  }

  if (requireAdmin && user.admin !== 1) {
    return <Navigate to="/cliente/proyectos" replace />;
  }

  if (requireAdmin && ipActual !== IP_AUTORIZADA) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md border border-red-100">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-xl font-black text-gray-900 uppercase italic">Acceso Restringido</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Tu ubicación actual no está autorizada para gestionar la base de datos.
          </p>
          <div className="mt-6 p-3 bg-gray-100 rounded-xl font-mono text-[10px] text-gray-400">
            IP_DTC: {ipActual}
          </div>
        </div>
      </div>
    );
  }

  return children;
};