import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CrearProyecto from "./pages/admin/CrearProyecto";
import ListaProyectosAdmin from "./pages/admin/ListaProyectosAdmin";
import DetalleProyectoAdmin from "./pages/admin/DetalleProyectoAdmin"; 
import ProyectosCliente from "./pages/cliente/ProyectosCliente";
import VistaPresupuestoCliente from "./pages/cliente/VistaPresupuestoCliente";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/proyectos" element={<ListaProyectosAdmin />} />
        <Route path="/admin/proyectos/:id" element={<DetalleProyectoAdmin />} />
        <Route path="/admin/proyectos/crear" element={<CrearProyecto />} />
        <Route path="/cliente/proyectos" element={<ProyectosCliente />} />
        <Route path="/cliente/proyecto/:id/presupuesto" element={<VistaPresupuestoCliente />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
