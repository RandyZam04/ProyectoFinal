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
    <div className="min-h-screen bg-[#f4f0eb] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-end mb-12 border-b border-[#18202b] pb-6">
          <div>
            <button 
              onClick={() => navigate("/admin")}
              className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.3em] mb-2 hover:text-[#18202b]"
            >
              ← Volver
            </button>
            <h1 className="text-4xl font-light text-[#18202b] uppercase tracking-wide">Cartera</h1>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#7d8b8d] uppercase tracking-widest">Total Registros</p>
            <p className="text-4xl font-thin text-[#18202b]">{clientesConProyectos.length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-20 text-[#bfb3a3] uppercase tracking-widest text-xs">Cargando base de datos...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {clientesConProyectos.map((cliente) => (
              <div key={cliente.idusuarios} className="bg-white border border-[#d4cbba] p-0 shadow-sm hover:border-[#18202b] transition-all">
                
                <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#fcfbf9] border-b border-[#d4cbba]">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#18202b] flex items-center justify-center text-white text-xl font-light">
                      {cliente.nombre ? cliente.nombre.charAt(0) : "U"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-light text-[#18202b] uppercase tracking-wide">{cliente.nombre}</h2>
                      <p className="text-[#646e75] text-xs font-mono">{cliente.email}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-[8px] font-bold uppercase border ${cliente.activo === 1 ? 'border-[#18202b] text-[#18202b]' : 'border-red-300 text-red-400'}`}>
                        {cliente.activo === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right mt-6 md:mt-0">
                    <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest">Inversión Histórica</p>
                    <p className="text-3xl font-light text-[#18202b]">
                      ${cliente.totalInvertido.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-[9px] font-bold text-[#18202b] uppercase tracking-widest mb-6 border-b border-[#dad8cc] pb-2 inline-block">Proyectos Asociados</p>
                  
                  {cliente.proyectos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-0 border border-[#dad8cc]">
                      {cliente.proyectos.map(proy => (
                        <div key={proy.idproyectos} className="p-4 flex justify-between items-center border-b border-[#dad8cc] last:border-0 hover:bg-[#f4f0eb] cursor-pointer"
                             onClick={() => navigate(`/admin/proyectos/${proy.idproyectos}`)}>
                          <div>
                            <span className="font-medium text-[#18202b] text-sm uppercase">{proy.nombre}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-light text-[#646e75] text-sm">
                                ${proy.montoTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#bfb3a3] italic text-xs">Sin proyectos activos.</p>
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