import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VistaPresupuestoCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPresupuesto = async () => {
      if (!id) {
        setError("No se proporcionó un ID de proyecto válido.");
        setCargando(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/presupuestos/proyecto/${id}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("El arquitecto aún no ha generado el presupuesto.");
          }
          throw new Error("Error al obtener datos del servidor.");
        }

        const data = await res.json();
        setDatos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerPresupuesto();
  }, [id]); // Solo se ejecuta cuando el ID cambia

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Cargando presupuesto oficial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center max-w-md mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="text-orange-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 font-bold mb-2">Aviso del Sistema</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
          >
            Regresar al Proyecto
          </button>
        </div>
      </div>
    );
  }

  // Cálculos después de las validaciones de carga y error
  const totalPresupuesto = Number(datos?.total || 0);
  const rubros = datos?.rubros || [];
  const totalAsignado = rubros.reduce((acc, r) => acc + Number(r.monto || 0), 0);
  const porcentajeUtilizado = totalPresupuesto > 0 
    ? ((totalAsignado / totalPresupuesto) * 100).toFixed(1) 
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* CABECERA RESUMEN */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Resumen de Inversión</h1>
              <p className="text-gray-500">Documento informativo de costos por categoría</p>
            </div>
            <span className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
              {datos?.estado || 'En Revisión'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="bg-blue-50 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Presupuesto Total</p>
              <p className="text-4xl font-black text-blue-900">${totalPresupuesto.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-green-400 uppercase mb-1">Total en Rubros</p>
              <p className="text-4xl font-black text-green-900">${totalAsignado.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex justify-between text-[10px] font-black text-gray-400 mb-2 uppercase tracking-tighter">
              <span>Distribución del presupuesto</span>
              <span className="text-blue-600">{porcentajeUtilizado}% utilizado</span>
            </div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden p-1">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${porcentajeUtilizado}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* LISTA DE RUBROS PARA CLIENTE */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Categorías autorizadas</h3>
          {rubros.map((rubro, index) => {
            const porcRubro = totalPresupuesto > 0 
                ? ((Number(rubro.monto) / totalPresupuesto) * 100).toFixed(1) 
                : 0;

            return (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center group">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-xl group-hover:text-blue-600 transition-colors">{rubro.nombre}</p>
                  <p className="text-sm text-gray-400 italic">{rubro.descripcion || 'Incluye materiales y mano de obra general.'}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-black text-gray-900">${Number(rubro.monto).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-blue-400 uppercase">{porcRubro}% del total</p>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="mt-10 w-full p-4 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors uppercase tracking-widest"
        >
          ← Volver a los detalles del proyecto
        </button>
      </div>
    </div>
  );
}