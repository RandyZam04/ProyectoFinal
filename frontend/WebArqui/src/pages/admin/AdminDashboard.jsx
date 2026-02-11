import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ proyectos: 0, presupuestoTotal: 0, clientes: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    { title: "Proyectos", desc: "Gestión de Obras", path: "/admin/proyectos", icon: "🏗️" },
    { title: "Clientes", desc: "Base de Datos", path: "/admin/usuarios", icon: "👥" },
    { title: "Reportes", desc: "Análisis Financiero", path: "/admin/reportes", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f0eb] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto border-l border-[#d4cbba] pl-8">
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-light text-[#18202b] uppercase tracking-wide">Panel Administrativo</h1>
            <div className="w-12 h-1 bg-[#18202b] mt-4 mb-2"></div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/proyectos/crear")} className="bg-[#18202b] hover:bg-[#474b54] text-white px-6 py-3 rounded-none font-bold text-[10px] uppercase tracking-widest transition-all">
              + Nuevo Proyecto
            </button>
            <button onClick={() => setShowLogoutModal(true)} className="border border-[#18202b] text-[#18202b] hover:bg-[#18202b] hover:text-white px-6 py-3 rounded-none font-bold text-[10px] uppercase tracking-widest transition-all">
              Salir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#d4cbba] bg-white mb-16">
          <div className="p-10 border-b md:border-b-0 md:border-r border-[#d4cbba]">
            <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.2em] mb-4">Proyectos Activos</p>
            <p className="text-6xl font-thin text-[#18202b]">{stats.proyectos}</p>
          </div>
          <div className="p-10 border-b md:border-b-0 md:border-r border-[#d4cbba]">
            <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.2em] mb-4">Cartera Clientes</p>
            <p className="text-6xl font-thin text-[#18202b]">{stats.clientes}</p>
          </div>
          <div className="p-10 bg-[#18202b] text-white">
            <p className="text-[9px] font-bold text-[#dad8cc] uppercase tracking-[0.2em] mb-4">Capital Total</p>
            <p className="text-3xl font-light mt-4">${stats.presupuestoTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <button key={item.title} onClick={() => navigate(item.path)} className="group bg-white p-8 h-64 border border-[#d4cbba] hover:border-[#18202b] hover:shadow-lg transition-all text-left flex flex-col justify-between">
              <div className="text-3xl opacity-40 group-hover:opacity-100 transition-opacity">{item.icon}</div>
              <div>
                <h3 className="text-xl font-light text-[#18202b] uppercase tracking-widest mb-1">{item.title}</h3>
                <p className="text-[#646e75] text-[10px] font-bold uppercase tracking-widest">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-[#18202b]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#f4f0eb] border border-[#d4cbba] p-10 max-w-sm w-full shadow-2xl text-center">
              <h2 className="text-xl font-light text-[#18202b] mb-6 uppercase tracking-widest">Cerrar Sesión</h2>
              <p className="text-[#646e75] mb-8 text-xs">¿Confirmar salida del sistema?</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmarCerrarSesion} className="bg-[#18202b] text-white py-4 rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-[#474b54]">Confirmar</button>
                <button onClick={() => setShowLogoutModal(false)} className="bg-transparent border border-[#18202b] text-[#18202b] py-4 rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-white">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}