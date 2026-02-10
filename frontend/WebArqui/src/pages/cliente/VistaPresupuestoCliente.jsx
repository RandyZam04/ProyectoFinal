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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-50"></div>
      <p className="mt-6 text-xs font-black uppercase tracking-widest text-gray-400">Sincronizando cuentas...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-red-50 text-center max-w-sm">
        <div className="text-6xl mb-4">📂</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 italic">Sin Presupuesto</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">{error}</p>
        <button onClick={() => navigate(-1)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Regresar</button>
      </div>
    </div>
  );

  const totalPresupuesto = Number(datos?.total || 0);
  const gastosAcumulados = Number(datos?.gastosReales || 0);
  const disponible = totalPresupuesto - gastosAcumulados;
  const porcentajeGastado = ((gastosAcumulados / totalPresupuesto) * 100).toFixed(1);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* BOTÓN REGRESAR SUPERIOR */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-all"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
              <span className="text-gray-600 group-hover:text-blue-600 text-lg">←</span>
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Volver al</span>
              <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-none">Detalle del Proyecto</span>
            </div>
          </button>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-l-4 border-blue-600 pl-6">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Estado Financiero de Obra</span>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mt-1 italic">Presupuesto</h1>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400">
            ID Proyecto: #{id}
          </div>
        </div>

        {/* TARJETAS DE IMPACTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Inversión Total</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">${totalPresupuesto.toLocaleString()}</p>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <p className="text-[10px] font-black  uppercase tracking-widest mb-3 text-gray-500">Gastos a la Fecha</p>
            <p className="text-4xl font-black tracking-tighter text-red-400 relative z-10">${gastosAcumulados.toLocaleString()}</p>
            <div className="absolute -right-4 -top-4 text-6xl opacity-10 rotate-12">📉</div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white">
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3">Saldo Disponible</p>
            <p className="text-4xl font-black tracking-tighter">${disponible.toLocaleString()}</p>
          </div>
        </div>

        {/* BARRA DE PROGRESO DE GASTO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 mb-10">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-black text-gray-900 italic">Ejecución del Presupuesto</h3>
            <span className="text-2xl font-black text-blue-600">{porcentajeGastado}%</span>
          </div>
          <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden p-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${Number(porcentajeGastado) > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${porcentajeGastado}%` }}
            ></div>
          </div>
          <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
            Este indicador muestra cuánto del dinero total ya ha sido facturado en obra.
          </p>
        </div>

        {/* DESGLOSE POR RUBROS */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-6">Desglose de Categorías</h3>
          {datos?.rubros?.map((rubro, index) => (
            <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between items-center group hover:border-blue-200 transition-all">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <p className="font-black text-2xl text-gray-900 group-hover:text-blue-600 transition-colors uppercase italic">{rubro.nombre}</p>
                <p className="text-sm text-gray-400 max-w-sm">{rubro.descripcion || 'Gestión integral de la categoría.'}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-3xl font-black text-gray-900 tracking-tighter">${Number(rubro.monto).toLocaleString()}</p>
                <div className="mt-1 bg-blue-50 px-3 py-1 rounded-lg inline-block text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                  Asignado en Contrato
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER DISCRETO */}
        <footer className="mt-20 py-10 border-t border-gray-200 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Reporte Oficial de Oficina Técnica</p>
        </footer>
      </div>
    </div>
  );
}