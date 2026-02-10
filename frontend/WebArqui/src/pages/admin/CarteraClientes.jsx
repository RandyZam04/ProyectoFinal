import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CarteraClientes() {
  const navigate = useNavigate();
  const [clientesConProyectos, setClientesConProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resUser, resProy] = await Promise.all([
          fetch("http://localhost:3000/api/usuarios"),
          fetch("http://localhost:3000/api/proyectos/1/1")
        ]);

        if (!resUser.ok || !resProy.ok) throw new Error("Error en las APIs");

        const usuarios = await resUser.json();
        const proyectos = await resProy.json();

        const dataCombinada = usuarios
          .filter(u => u.admin === 0)
          .map(cliente => {
            const susProyectos = proyectos
              .filter(p => p.id_cliente === cliente.idusuarios)
              .map(proy => {
                const valorExtraido = proy.presupuesto || proy.monto || proy.presupuesto_total || 0;
                
                return {
                  ...proy,
                  montoTotal: parseFloat(valorExtraido) || 0
                };
              });

            const inversionAcumulada = susProyectos.reduce((acc, p) => acc + p.montoTotal, 0);
            
            return {
              ...cliente,
              proyectos: susProyectos,
              totalInvertido: inversionAcumulada
            };
          });

        setClientesConProyectos(dataCombinada);
      } catch (err) {
        console.error("Error cargando cartera:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <button 
              onClick={() => navigate("/admin")}
              className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2 hover:underline"
            >
              ← Volver al Panel
            </button>
            <h1 className="text-5xl font-black tracking-tighter">Cartera de Clientes</h1>
            <p className="text-gray-400 mt-2 text-lg italic">Visualización de activos por cliente.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clientes Totales</p>
            <p className="text-4xl font-black text-blue-600">{clientesConProyectos.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <p className="text-gray-400 animate-pulse font-black uppercase tracking-widest">Cargando base de datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {clientesConProyectos.map((cliente) => (
              <div key={cliente.idusuarios} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                
                <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                      {cliente.nombre ? cliente.nombre.charAt(0) : "U"}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{cliente.nombre}</h2>
                      <p className="text-gray-400">{cliente.email}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${cliente.activo === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {cliente.activo === 1 ? 'Cuenta Activa' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right mt-6 md:mt-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inversión Total Acumulada</p>
                    <p className="text-4xl font-black text-gray-900">
                      ${cliente.totalInvertido.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Proyectos Vinculados</p>
                  
                  {cliente.proyectos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {cliente.proyectos.map(proy => (
                        <div key={proy.idproyectos} className="bg-white p-6 rounded-3xl shadow-sm flex justify-between items-center border border-transparent hover:border-blue-500 transition-all cursor-pointer"
                             onClick={() => navigate(`/admin/proyectos/${proy.idproyectos}`)}>
                          <div>
                            <span className="text-[10px] font-black text-blue-600 uppercase block mb-1">Nombre del Proyecto</span>
                            <span className="font-bold text-xl text-gray-800">{proy.nombre}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Presupuesto</span>
                            <span className="font-black text-2xl text-gray-900">
                                ${proy.montoTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No hay proyectos para este cliente.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}