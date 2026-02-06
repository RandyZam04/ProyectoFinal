import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DetalleProyectoAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [proyecto, setProyecto] = useState(null);
  const [rubros, setRubros] = useState([{ nombre: "", cantidad: 1, costo_unitario: 0 }]);
  const [estado, setEstado] = useState("Pendiente");

  useEffect(() => {
    fetch(`http://localhost:3000/api/proyectos_detalle/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Proyecto no encontrado");
        return res.json();
      })
      .then(data => setProyecto(data))
      .catch(err => console.error("Error:", err));
  }, [id]);

  const totalPresupuesto = rubros.reduce((acc, r) => acc + (Number(r.cantidad) * Number(r.costo_unitario)), 0);

  const manejarCambioRubro = (index, e) => {
    const { name, value } = e.target;
    const nuevosRubros = [...rubros];
    nuevosRubros[index][name] = value;
    setRubros(nuevosRubros);
  };

  const agregarRubro = () => setRubros([...rubros, { nombre: "", cantidad: 1, costo_unitario: 0 }]);

  const guardarPresupuesto = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/presupuestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            id_proyecto: id, 
            estado, 
            fecha: new Date().toISOString().split('T')[0],
            rubros 
        })
      });
      if (res.ok) {
        alert("Presupuesto guardado con éxito");
        navigate("/admin/proyectos");
      }
    } catch {
      alert("Error al conectar con el servidor");
    }
  };

  if (!proyecto) return <div className="p-10 text-center">Cargando detalles del proyecto...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Presupuesto: {proyecto.nombre}
        </h1>
        <p className="text-gray-600 mb-8">{proyecto.descripcion}</p>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-xl font-semibold">Configuración de Rubros</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Estado:</span>
              <select 
                value={estado} 
                onChange={(e) => setEstado(e.target.value)}
                className="border border-gray-300 p-2 rounded-md text-sm bg-gray-50"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Enviado">Enviado</option>
                <option value="Aprobado">Aprobado</option>
              </select>
            </div>
          </div>

          {rubros.map((rubro, index) => {
            const subtotal = Number(rubro.cantidad) * Number(rubro.costo_unitario);
            const porcentaje = totalPresupuesto > 0 ? ((subtotal / totalPresupuesto) * 100).toFixed(1) : 0;

            return (
              <div key={index} className="flex gap-4 mb-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Descripción</label>
                  <input name="nombre" placeholder="Ej: Materiales" className="w-full border-b border-gray-300 bg-transparent p-1 focus:border-blue-500 outline-none" value={rubro.nombre} onChange={(e) => manejarCambioRubro(index, e)} />
                </div>
                <div className="w-24">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Cant.</label>
                  <input name="cantidad" type="number" className="w-full border-b border-gray-300 bg-transparent p-1 focus:border-blue-500 outline-none" value={rubro.cantidad} onChange={(e) => manejarCambioRubro(index, e)} />
                </div>
                <div className="w-32">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Costo Unit.</label>
                  <input name="costo_unitario" type="number" className="w-full border-b border-gray-300 bg-transparent p-1 focus:border-blue-500 outline-none" value={rubro.costo_unitario} onChange={(e) => manejarCambioRubro(index, e)} />
                </div>
                <div className="text-right w-44">
                  <p className="font-bold text-blue-700 text-lg">${subtotal.toFixed(2)}</p>
                  <p className="text-[10px] text-blue-400 font-bold">{porcentaje}% del total</p>
                </div>
              </div>
            );
          })}
          
          <div className="mt-8 pt-6 border-t flex justify-between items-center">
            <button onClick={agregarRubro} className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
              + AGREGAR OTRO RUBRO
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-black">Total a Presupuestar</p>
              <p className="text-4xl font-black text-gray-900">${totalPresupuesto.toFixed(2)}</p>
              <button 
                onClick={guardarPresupuesto} 
                className="bg-blue-600 text-white px-10 py-3 rounded-lg mt-4 font-bold hover:bg-blue-700 shadow-md transition-all"
              >
                GUARDAR PRESUPUESTO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}