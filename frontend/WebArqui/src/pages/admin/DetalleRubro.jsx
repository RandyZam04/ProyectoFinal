import React from "react";

export default function DetalleRubro({ rubro, avances = [], alCerrar }) {
  const totalGastado = avances
    .reduce((acc, curr) => acc + Number(curr.monto_gastado || 0), 0);

  const presupuesto = Number(rubro.monto || 0);
  const diferencia = presupuesto - totalGastado;
  const esExceso = diferencia < 0;

  const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return "S/F";
    return fechaRaw.split('T')[0];
  };

  return (
    <div className="animate-fadeIn space-y-8 max-w-5xl mx-auto p-4">
      {/* Botón Volver */}
      <button 
        onClick={alCerrar}
        className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors flex items-center gap-2"
      >
        <span className="text-lg">←</span> Volver al Presupuesto Global
      </button>

      {/* Header del Rubro */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-8">
        <div>
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Detalle de Rubro
          </span>
          <h2 className="text-4xl font-black text-gray-900 mt-4 tracking-tighter">{rubro.nombre}</h2>
          <p className="text-gray-400 mt-2 italic">{rubro.descripcion || "Sin descripción"}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-gray-50 p-6 rounded-3xl min-w-[160px] text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Presupuesto</p>
            <p className="text-2xl font-black text-gray-900">${presupuesto.toLocaleString()}</p>
          </div>
          <div className={`${esExceso ? 'bg-red-50' : 'bg-blue-50'} p-6 rounded-3xl min-w-[160px] text-center border ${esExceso ? 'border-red-100' : 'border-blue-100'}`}>
            <p className={`text-[10px] font-black uppercase mb-1 tracking-widest ${esExceso ? 'text-red-400' : 'text-blue-400'}`}>
              {esExceso ? 'Déficit' : 'Disponible'}
            </p>
            <p className={`text-2xl font-black ${esExceso ? 'text-red-600' : 'text-blue-600'}`}>
              ${Math.abs(diferencia).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de Gastos */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest ml-6">Línea de tiempo de gastos</h3>
        
        {avances.length > 0 ? (
          avances.map((avance, i) => (
            <div key={avance.idgastos || i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm">
              <div className="flex items-center gap-6">
                <div className="text-center border-r pr-6 border-gray-100">
                  <p className="text-[11px] font-black text-gray-400 uppercase leading-none">
                    {formatearFecha(avance.fecha)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-lg tracking-tight">{avance.descripcion || "Gasto sin descripción"}</p>
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Monto registrado</span>
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">
                ${Number(avance.monto_gastado).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem]">
            <p className="text-gray-400 font-bold italic">No hay gastos registrados para este rubro aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}