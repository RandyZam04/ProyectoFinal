import { useEffect, useState } from "react";
import DetalleRubro from "./DetalleRubro";

const ProgressCircle = ({ porcentaje, size = 50, strokeWidth = 5, colorClass = "text-blue-600" }) => {
  const radio = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radio;
  const offset = circ - (porcentaje / 100) * circ;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radio} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size/2} cy={size/2} r={radio} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
          strokeDasharray={circ}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          className={`${colorClass} drop-shadow-[0_0_3px_rgba(37,99,235,0.3)]`}
        />
      </svg>
      {size > 60 && (
        <div className="absolute flex flex-col items-center">
            <span className="text-xl font-black text-gray-900">{porcentaje.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

export default function SeccionPresupuesto({ idProyecto }) {
  const [montoMaximo, setMontoMaximo] = useState(0); 
  const [rubros, setRubros] = useState([{ nombre: "", descripcion: "", monto: 0 }]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [gastosRealizados, setGastosRealizados] = useState([]); 

  useEffect(() => {
    fetch(`http://localhost:3000/api/presupuestos/proyecto/${idProyecto}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setMontoMaximo(data.total);
        setRubros(data.rubros);
      }).catch(() => console.log("Iniciando presupuesto"));

  }, [idProyecto]);

  const totalAsignado = rubros.reduce((acc, r) => acc + Number(r.monto), 0);
  const porcentajeTotal = montoMaximo > 0 ? Math.min((totalAsignado / montoMaximo) * 100, 100) : 0;

  const manejarCambioRubro = (index, e) => {
    const { name, value } = e.target;
    const nuevosRubros = [...rubros];
    nuevosRubros[index][name] = value;
    setRubros(nuevosRubros);
  };

  const guardarPresupuesto = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/presupuestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            id_proyecto: idProyecto, 
            total: montoMaximo,
            estado: "Pendiente", 
            fecha: new Date().toISOString().split('T')[0],
            rubros 
        })
      });
      if (res.ok) alert("✅ Cambios guardados en la nube");
    } catch {
      alert("Error al guardar");
    }
  };

  if (rubroSeleccionado) {
    return (
      <DetalleRubro 
        rubro={rubroSeleccionado} 
        avances={gastosRealizados} 
        alCerrar={() => setRubroSeleccionado(null)} 
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-fadeIn px-4">
      
      <div className="bg-white rounded-[2rem] p-10 mb-12 shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col md:flex-row items-center gap-12">
        <div className="flex items-center gap-8">
          <ProgressCircle 
            porcentaje={porcentajeTotal} 
            size={120} 
            strokeWidth={10} 
            colorClass={totalAsignado > montoMaximo ? "text-red-600" : "text-blue-700"} 
          />
          <div className="space-y-1">
            <label className="text-xs font-black text-blue-900/40 uppercase tracking-[0.2em]">Presupuesto Límite</label>
            <div className="flex items-center">
              <span className="text-3xl font-light text-gray-300 mr-2">$</span>
              <input 
                type="number" 
                value={montoMaximo} 
                onChange={(e) => setMontoMaximo(Number(e.target.value))} 
                className="text-5xl font-black text-gray-900 outline-none w-64 bg-transparent focus:text-blue-700 transition-colors"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="md:ml-auto flex flex-col items-end gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-12 w-full md:w-auto">
            <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total acumulado</p>
                <p className={`text-4xl font-black ${totalAsignado > montoMaximo ? 'text-red-600' : 'text-gray-900'}`}>
                    ${totalAsignado.toLocaleString()}
                </p>
            </div>
            <button onClick={guardarPresupuesto} className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-700/20 active:scale-95">
                Guardar Presupuesto
            </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-6">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Desglose de Obra</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase italic">Costo por categoría</span>
        </div>

        {rubros.map((rubro, index) => {
          const porcIndividual = montoMaximo > 0 ? ((Number(rubro.monto) / montoMaximo) * 100).toFixed(1) : 0;
          return (
            <div 
              key={index} 
              // --- SE AÑADE EL CLICK PARA IR AL DETALLE ---
              onClick={() => setRubroSeleccionado(rubro)}
              className="bg-white hover:shadow-md p-6 rounded-[1.5rem] border border-gray-100 flex items-center gap-8 transition-all group cursor-pointer"
            >
              
              <ProgressCircle porcentaje={parseFloat(porcIndividual)} size={55} strokeWidth={6} colorClass="text-blue-500" />

              <div className="flex-1 space-y-1">
                <input 
                  name="nombre" 
                  placeholder="Nombre del rubro..." 
                  className="font-black text-gray-800 outline-none w-full bg-transparent text-xl placeholder:text-gray-200" 
                  value={rubro.nombre} 
                  onChange={(e) => manejarCambioRubro(index, e)} 
                  onClick={(e) => e.stopPropagation()} 
                />
                <input 
                  name="descripcion" 
                  placeholder="Añade una nota o descripción..." 
                  className="text-sm text-gray-400 outline-none w-full bg-transparent italic" 
                  value={rubro.descripcion} 
                  onChange={(e) => manejarCambioRubro(index, e)} 
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>
              
              <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                <div className="text-right">
                    <div className="flex items-center justify-end">
                        <span className="text-gray-300 font-bold mr-1">$</span>
                        <input 
                          name="monto" 
                          type="number" 
                          className="w-32 text-right outline-none bg-transparent font-black text-2xl text-gray-900" 
                          value={rubro.monto} 
                          onChange={(e) => manejarCambioRubro(index, e)} 
                        />
                    </div>
                    <div className="bg-blue-50 px-2 py-0.5 rounded-lg inline-block mt-1">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{porcIndividual}% del total</p>
                    </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRubros(rubros.filter((_, i) => i !== index));
                  }} 
                  className="opacity-0 group-hover:opacity-100 p-3 bg-red-50 text-red-300 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        <button 
          onClick={() => setRubros([...rubros, { nombre: "", descripcion: "", monto: 0 }])}
          className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[1.5rem] text-gray-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all mt-6"
        >
          + Añadir nueva categoría
        </button>
      </div>
    </div>
  );
}