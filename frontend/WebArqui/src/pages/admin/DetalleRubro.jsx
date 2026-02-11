import React from "react";

export default function DetalleRubro({ rubro, avances = [], alCerrar }) {
  const totalGastado = avances.reduce((acc, curr) => acc + Number(curr.monto_gastado || 0), 0);
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
        className="text-[10px] font-bold text-[#bfb3a3] uppercase tracking-[0.2em] hover:text-[#18202b] transition-colors"
      >
        ← Volver al Presupuesto Global
      </button>

      {/* Header del Rubro */}
      <div className="bg-white p-12 border border-[#d4cbba] flex flex-col md:flex-row justify-between gap-8">
        <div>
          <span className="bg-[#18202b] text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
            Detalle de Partida
          </span>
          <h2 className="text-4xl font-light text-[#18202b] mt-4 uppercase">{rubro.nombre}</h2>
          <p className="text-[#646e75] mt-2 font-light">{rubro.descripcion || "Sin descripción técnica"}</p>
        </div>

        <div className="flex gap-0 border border-[#dad8cc]">
          <div className="p-6 text-center border-r border-[#dad8cc]">
            <p className="text-[9px] font-bold text-[#bfb3a3] uppercase mb-1 tracking-widest">Presupuesto</p>
            <p className="text-2xl font-light text-[#18202b]">${presupuesto.toLocaleString()}</p>
          </div>
          <div className={`p-6 text-center ${esExceso ? 'bg-red-50' : 'bg-[#fcfbf9]'}`}>
            <p className={`text-[9px] font-bold uppercase mb-1 tracking-widest ${esExceso ? 'text-red-400' : 'text-[#7d8b8d]'}`}>
              {esExceso ? 'Déficit' : 'Disponible'}
            </p>
            <p className={`text-2xl font-light ${esExceso ? 'text-red-700' : 'text-[#18202b]'}`}>
              ${Math.abs(diferencia).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de Gastos */}
      <div className="space-y-0 border-t border-[#18202b]">
        <div className="py-4">
            <h3 className="text-[10px] font-bold text-[#18202b] uppercase tracking-widest">Historial de Egresos</h3>
        </div>
        
        {avances.length > 0 ? (
          avances.map((avance, i) => (
            <div key={avance.idgastos || i} className="bg-white p-6 border-b border-[#dad8cc] flex items-center justify-between hover:bg-[#f9f8f6] transition-all">
              <div className="flex items-center gap-6">
                <div className="text-center w-24">
                  <p className="text-[10px] font-bold text-[#bfb3a3] uppercase">
                    {formatearFecha(avance.fecha)}
                  </p>
                </div>
                <div className="border-l border-[#dad8cc] pl-6">
                  <p className="text-[#18202b] font-medium uppercase tracking-wide text-sm">{avance.descripcion || "Gasto general"}</p>
                  <span className="text-[9px] text-[#7d8b8d] uppercase tracking-widest">Registrado en sistema</span>
                </div>
              </div>
              <p className="text-xl font-light text-[#18202b]">
                ${Number(avance.monto_gastado).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="p-12 text-center border border-dashed border-[#d4cbba]">
            <p className="text-[#bfb3a3] italic text-xs uppercase tracking-widest">No hay gastos registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
}