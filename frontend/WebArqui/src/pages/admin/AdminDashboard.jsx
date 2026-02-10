import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ proyectos: 0, presupuestoTotal: 0, clientes: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // SEGURIDAD: Bloqueo de navegación y limpieza
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const manejarRetroceso = () => {
      setShowLogoutModal(true);
      window.history.pushState(null, null, window.location.pathname);
    };

    const cerrarAlSalir = () => {
      localStorage.removeItem("usuario");
    };

    window.addEventListener("popstate", manejarRetroceso);
    window.addEventListener("beforeunload", cerrarAlSalir);

    return () => {
      window.removeEventListener("popstate", manejarRetroceso);
      window.removeEventListener("beforeunload", cerrarAlSalir);
    };
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (!user || user.admin !== 1) {
      navigate("/");
      return;
    }

    const cargarMetricasGlobales = async () => {
      try {
        const resProy = await fetch("http://localhost:3000/api/proyectos/1/1");
        const resUser = await fetch("http://localhost:3000/api/usuarios");
        if (!resProy.ok || !resUser.ok) throw new Error("Error en el servidor");

        const proyectos = await resProy.json();
        const usuarios = await resUser.json();

        setStats({
          proyectos: proyectos.length,
          clientes: usuarios.filter(u => u.admin === 0).length,
          presupuestoTotal: proyectos.reduce((acc, p) => acc + (parseFloat(p.presupuesto) || 0), 0)
        });
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    cargarMetricasGlobales();
  }, [navigate]);

  const confirmarCerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const menuItems = [
    { title: "Proyectos", desc: "Gestionar obras y presupuestos", path: "/admin/proyectos", icon: "🏗️", color: "bg-blue-600" },
    { title: "Clientes", desc: "Base de datos de usuarios", path: "/admin/usuarios", icon: "👥", color: "bg-gray-900" },
    { title: "Reportes", desc: "Análisis de gastos global", path: "/admin/reportes", icon: "📊", color: "bg-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Panel de Control</span>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mt-1">Administración</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/proyectos/crear")} className="bg-blue-600 hover:bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center gap-2">
              <span className="text-lg">+</span> Proyecto
            </button>
            <button onClick={() => setShowLogoutModal(true)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-4 rounded-2xl transition-all shadow-sm border border-red-100">
              <span className="font-black text-xs uppercase tracking-widest">Salir 🚪</span>
            </button>
          </div>
        </div>

        {/* Stats y Menú... (Igual que tu código anterior) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Proyectos Activos</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.proyectos}</p>
          </div>
          <div className="bg-blue-700 p-8 rounded-[2.5rem] shadow-xl text-white">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Cartera de Clientes</p>
            <p className="text-5xl font-black tracking-tighter">{stats.clientes}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inversión Total</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">${stats.presupuestoTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button key={item.title} onClick={() => navigate(item.path)} className="group bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 hover:border-blue-500 transition-all text-left">
              <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>{item.icon}</div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
            </button>
          ))}
        </div>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 italic">Cierre de Sesión</h2>
              <p className="text-gray-500 mb-8 text-sm">¿Deseas abandonar el panel administrativo de forma segura?</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmarCerrarSesion} className="bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Sí, cerrar sesión segura</button>
                <button onClick={() => setShowLogoutModal(false)} className="bg-gray-100 text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}