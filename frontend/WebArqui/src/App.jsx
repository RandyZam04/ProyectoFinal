import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CrearProyecto from "./pages/admin/CrearProyecto";
import ListaProyectosAdmin from "./pages/admin/ListaProyectosAdmin";
import DetalleProyectoAdmin from "./pages/admin/DetalleProyectoAdmin"; 
import ProyectosCliente from "./pages/cliente/ProyectosCliente";
import VistaPresupuestoCliente from "./pages/cliente/VistaPresupuestoCliente";
import CarteraClientes from "./pages/admin/CarteraClientes";
import ReportesGlobales from "./pages/admin/ReportesGlobales";
import AvancesCliente from "./pages/cliente/AvancesCliente";
import DetalleProyectoCliente from "./pages/cliente/DetalleProyectoCliente";
import RegistroCliente from "./pages/cliente/RegistroCliente";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<RegistroCliente />} />

        {/* RUTAS DE ADMINISTRADOR */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}> <AdminDashboard /> </ProtectedRoute>
        } />
        <Route path="/admin/proyectos" element={
          <ProtectedRoute requireAdmin={true}> <ListaProyectosAdmin /> </ProtectedRoute>
        } />
        <Route path="/admin/proyectos/:id" element={
          <ProtectedRoute requireAdmin={true}> <DetalleProyectoAdmin /> </ProtectedRoute>
        } />
        <Route path="/admin/proyectos/crear" element={
          <ProtectedRoute requireAdmin={true}> <CrearProyecto /> </ProtectedRoute>
        } />
        <Route path="/admin/usuarios" element={
          <ProtectedRoute requireAdmin={true}> <CarteraClientes /> </ProtectedRoute>
        } />
        <Route path="/admin/reportes" element={
          <ProtectedRoute requireAdmin={true}> <ReportesGlobales /> </ProtectedRoute>
        } />

        {/* RUTAS DE CLIENTE */}
        <Route path="/cliente/proyectos" element={
          <ProtectedRoute> <ProyectosCliente /> </ProtectedRoute>
        } />
        <Route path="/cliente/proyecto/:id" element={
          <ProtectedRoute> <DetalleProyectoCliente /> </ProtectedRoute>
        } />
        <Route path="/cliente/proyecto/:id/presupuesto" element={
          <ProtectedRoute> <VistaPresupuestoCliente /> </ProtectedRoute>
        } />
        <Route path="/cliente/proyecto/:id/avances" element={
          <ProtectedRoute> <AvancesCliente /> </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;