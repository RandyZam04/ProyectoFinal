import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VistaPresupuestoCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerDatosCompletos = async () => {
      try {
        const resPre = await fetch(`http://localhost:3000/api/presupuestos/proyecto/${id}`);
        if (!resPre.ok) throw new Error("El presupuesto aún no está disponible.");
        const dataPre = await resPre.json();

        const resGas = await fetch(`http://localhost:3000/api/reportes/resumen-financiero`); 
        const dataGas = await resGas.json();

        setDatos({
          ...dataPre,
          gastosReales: dataGas.gastosTotales || 0 
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatosCompletos();
  }, [id]);

  if (cargando) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f0eb]">
      <p className="text-xs font-bold uppercase tracking-widest text-[#bfb3a3]">Cargando Finanzas...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f0eb] p-6">
      <div className="bg-white p-12 border border-[#d4cbba] text-center max-w-sm">
        <h2 className="text-xl font-light text-[#18202b] mb-2 uppercase tracking-wide">Sin Datos</h2>
        <p className="text-[#646e75] text-sm mb-8 leading-relaxed">{error}</p>
        <button onClick={() => navigate(-1)} className="w-full bg-[#18202b] text-white py-4 font-bold text-[10px] uppercase tracking-widest rounded-none">Regresar</button>
      </div>
    </div>
  );

  const totalPresupuesto = Number(datos?.total || 0);
  const gastosAcumulados = Number(datos?.gastosReales || 0);
  const disponible = totalPresupuesto - gastosAcumulados;
  const porcentajeGastado = ((gastosAcumulados / totalPresupuesto) * 100).toFixed(1);

  return (
    <div className="p-8 bg-[#f4f0eb] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[10px] font-bold text-[#bfb3a3] uppercase tracking-[0.3em] hover:text-[#18202b]"
          >
            ← Volver
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#18202b] pb-6">
          <div>
            <span className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-[0.3em]">Estado Financiero</span>
            <h1 className="text-4xl font-light text-[#18202b] uppercase tracking-wide mt-1">Presupuesto</h1>
          </div>
          <div className="font-bold text-[10px] uppercase tracking-widest text-[#646e75]">
            REF: #{id}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#d4cbba] bg-white mb-16">
          <div className="p-10 border-b md:border-b-0 md:border-r border-[#d4cbba]">
            <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-3">Inversión Total</p>
            <p className="text-4xl font-light text-[#18202b]">${totalPresupuesto.toLocaleString()}</p>
          </div>
          
          <div className="bg-[#18202b] p-10 text-white">
            <p className="text-[9px] font-bold text-[#dad8cc] uppercase tracking-widest mb-3">Ejecutado</p>
            <p className="text-4xl font-light">${gastosAcumulados.toLocaleString()}</p>
          </div>

          <div className="p-10">
            <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-3">Disponible</p>
            <p className="text-4xl font-light text-[#18202b]">${disponible.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-10 border border-[#d4cbba] mb-16">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-sm font-bold text-[#18202b] uppercase tracking-widest">Barra de Ejecución</h3>
            <span className="text-xl font-light text-[#18202b]">{porcentajeGastado}%</span>
          </div>
          <div className="w-full bg-[#f4f0eb] h-2">
            <div 
              className="h-full bg-[#18202b] transition-all duration-1000 ease-out"
              style={{ width: `${porcentajeGastado}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-0 border-t border-[#18202b]">
          <div className="py-6">
             <h3 className="text-[10px] font-bold text-[#18202b] uppercase tracking-widest">Desglose de Partidas</h3>
          </div>
          {datos?.rubros?.map((rubro, index) => (
            <div key={index} className="bg-white p-8 border-b border-[#d4cbba] flex flex-col md:flex-row justify-between items-center hover:bg-[#fcfbf9]">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <p className="font-light text-xl text-[#18202b] uppercase tracking-wide">{rubro.nombre}</p>
                <p className="text-xs text-[#646e75] font-light mt-1">{rubro.descripcion || 'Sin especificaciones'}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-2xl font-light text-[#18202b]">${Number(rubro.monto).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}