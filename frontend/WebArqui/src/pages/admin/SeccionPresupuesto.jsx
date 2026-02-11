import { useEffect, useState } from "react";
import DetalleRubro from "./DetalleRubro";

const ProgressCircle = ({ porcentaje, size = 50, strokeWidth = 2, colorClass = "text-[#18202b]" }) => {
  const radio = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radio;
  const offset = circ - (porcentaje / 100) * circ;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radio} stroke="#dad8cc" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size/2} cy={size/2} r={radio} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
          strokeDasharray={circ}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          className={`${colorClass}`}
        />
      </svg>
      {size > 60 && (
        <div className="absolute flex flex-col items-center">
            <span className="text-xl font-light text-[#18202b]">{porcentaje.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

export default function SeccionPresupuesto({ idProyecto }) {
  const [montoMaximo, setMontoMaximo] = useState(0); 
  const [rubros, setRubros] = useState([]);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [gastosRealizados, setGastosRealizados] = useState([]); 

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/presupuestos/proyecto/${idProyecto}`);
        if (res.ok) {
          const data = await res.json();
          setMontoMaximo(data.total || 0);
          setRubros(data.rubros || []);
        }
      } catch (error) {
        console.error("Error al obtener presupuesto:", error);
      }
    };
    cargarDatos();
  }, [idProyecto]);

  // 2. FUNCIÓN PARA VER DETALLE
  const abrirDetalleRubro = async (rubro) => {
    try {
      if (!rubro.idrubros) {
        setGastosRealizados([]);
        setRubroSeleccionado(rubro);
        return;
      }

      const res = await fetch(`http://localhost:3000/api/gastos/rubro/${rubro.idrubros}`);
      const data = await res.json();
      
      setGastosRealizados(data);
      setRubroSeleccionado(rubro);
    } catch (error) {
      console.error("Error al cargar historial de gastos:", error);
      setGastosRealizados([]);
      setRubroSeleccionado(rubro);
    }
  };

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
      if (res.ok) alert("Presupuesto actualizado correctamente");
    } catch {
      alert("Error al guardar en el servidor");
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
      
      {/* HEADER DE PRESUPUESTO */}
      <div className="bg-white border border-[#d4cbba] p-10 mb-12 shadow-sm flex flex-col md:flex-row items-center gap-12">
        <div className="flex items-center gap-8">
          <ProgressCircle 
            porcentaje={porcentajeTotal} 
            size={100} 
            strokeWidth={4} 
            colorClass={totalAsignado > montoMaximo ? "text-red-700" : "text-[#18202b]"} 
          />
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-[#646e75] uppercase tracking-[0.3em]">Límite Presupuestal</label>
            <div className="flex items-center border-b border-[#18202b]">
              <span className="text-2xl font-light text-[#bfb3a3] mr-2">$</span>
              <input 
                type="number" 
                value={montoMaximo} 
                onChange={(e) => setMontoMaximo(Number(e.target.value))} 
                className="text-4xl font-light text-[#18202b] outline-none w-48 bg-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="md:ml-auto flex flex-col items-end gap-6 w-full md:w-auto">
            <div className="text-right">
                <p className="text-[9px] font-bold text-[#bfb3a3] uppercase tracking-widest mb-1">Asignado</p>
                <p className={`text-3xl font-light ${totalAsignado > montoMaximo ? 'text-red-700' : 'text-[#474b54]'}`}>
                    ${totalAsignado.toLocaleString()}
                </p>
            </div>
            <button onClick={guardarPresupuesto} className="bg-[#18202b] hover:bg-[#474b54] text-white px-8 py-3 rounded-none font-bold text-[10px] uppercase tracking-widest transition-all">
                Guardar Cambios
            </button>
        </div>
      </div>

      {/* LISTADO DE RUBROS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-4 border-b border-[#18202b] pb-2 mb-6">
            <h3 className="text-xs font-bold text-[#18202b] uppercase tracking-[0.3em]">Partidas Presupuestarias</h3>
        </div>

        {rubros.map((rubro, index) => {
          const porcIndividual = montoMaximo > 0 ? ((Number(rubro.monto) / montoMaximo) * 100).toFixed(1) : 0;
          return (
            <div 
              key={rubro.idrubros || index} 
              onClick={() => abrirDetalleRubro(rubro)}
              className="group bg-white hover:bg-[#f9f8f6] p-6 border-b border-[#d4cbba] flex items-center gap-8 transition-all cursor-pointer"
            >
              
              <span className="text-[10px] font-bold text-[#bfb3a3] w-8">{index + 1}.</span>

              <div className="flex-1 space-y-1">
                <input 
                  name="nombre" 
                  placeholder="Concepto..." 
                  className="font-normal text-[#18202b] outline-none w-full bg-transparent text-lg placeholder-[#dad8cc] uppercase tracking-wide" 
                  value={rubro.nombre} 
                  onChange={(e) => manejarCambioRubro(index, e)} 
                  onClick={(e) => e.stopPropagation()}
                />
                <input 
                  name="descripcion" 
                  placeholder="Especificaciones técnicas..." 
                  className="text-xs text-[#646e75] outline-none w-full bg-transparent font-light" 
                  value={rubro.descripcion} 
                  onChange={(e) => manejarCambioRubro(index, e)} 
                  onClick={(e) => e.stopPropagation()} 
                />
              </div>
              
              <div className="flex items-center gap-8" onClick={(e) => e.stopPropagation()}>
                <div className="text-right">
                    <input 
                      name="monto" 
                      type="number" 
                      className="w-32 text-right outline-none bg-transparent font-light text-xl text-[#18202b]" 
                      value={rubro.monto} 
                      onChange={(e) => manejarCambioRubro(index, e)} 
                    />
                    <p className="text-[9px] font-bold text-[#7d8b8d] uppercase mt-1">{porcIndividual}%</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRubros(rubros.filter((_, i) => i !== index));
                  }} 
                  className="text-[#dad8cc] hover:text-red-700 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        <button 
          onClick={() => setRubros([...rubros, { nombre: "", descripcion: "", monto: 0 }])}
          className="w-full py-6 border border-dashed border-[#d4cbba] text-[#7d8b8d] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:border-[#18202b] hover:text-[#18202b] transition-all mt-8"
        >
          + Agregar Partida
        </button>
      </div>
    </div>
  );
}