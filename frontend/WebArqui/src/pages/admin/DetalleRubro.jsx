import React from "react";

export default function DetalleRubro({ rubro, avances = [], alCerrar }) {
  const totalGastado = avances
    .filter(a => a.id_rubro === rubro.idrubros)
    .reduce((acc, curr) => acc + Number(curr.monto), 0);

  const diferencia = rubro.monto - totalGastado;
  const esExceso = diferencia < 0;

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Botón Volver */}
      <button 
        onClick={alCerrar}
        className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
      >
        ← Volver al Presupuesto Global
      </button>

      {/* Header del Rubro */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-8">
        <div>
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Detalle de Rubro
          </span>
          <h2 className="text-4xl font-black text-gray-900 mt-4 tracking-tighter">{rubro.nombre}</h2>
          <p className="text-gray-400 mt-2 italic">{rubro.descripcion}</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-gray-50 p-6 rounded-3xl min-w-[160px]">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Presupuesto</p>
            <p className="text-2xl font-black text-gray-900">${Number(rubro.monto).toLocaleString()}</p>
          </div>
          <div className={`${esExceso ? 'bg-red-50' : 'bg-blue-50'} p-6 rounded-3xl min-w-[160px]`}>
            <p className={`text-[10px] font-black uppercase mb-1 ${esExceso ? 'text-red-400' : 'text-blue-400'}`}>
              {esExceso ? 'Déficit' : 'Disponible'}
            </p>
            <p className={`text-2xl font-black ${esExceso ? 'text-red-600' : 'text-blue-600'}`}>
              ${Math.abs(diferencia).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de "Tweets" / Avances afiliados */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest ml-6">Línea de tiempo de gastos</h3>
        
        {avances.filter(a => a.id_rubro === rubro.idrubros).length > 0 ? (
          avances.filter(a => a.id_rubro === rubro.idrubros).map((avance, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-6">
                <div className="text-center border-r pr-6 border-gray-100">
                  <p className="text-[10px] font-black text-gray-300 uppercase leading-none">{avance.fecha.split(' ')[0]}</p>
                  <p className="text-lg font-black text-gray-400 uppercase">{avance.fecha.split(' ')[1]}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">{avance.descripcion}</p>
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Gasto registrado</span>
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">${Number(avance.monto).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem]">
            <p className="text-gray-400 font-bold italic">No hay avances registrados para este rubro aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}