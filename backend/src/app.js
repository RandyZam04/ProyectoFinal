import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.routes.js";
import proyectosRoutes from "./routes/proyectos.routes.js";
import presupuestosRoutes from "./routes/presupuestos.routes.js";
import avancesRoutes from "./routes/avances.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import detalleRoutes from "./routes/detalle.routes.js";
import avancesClienteRoutes from "./routes/avancesCliente.routes.js";
import comentarioRoutes from "./routes/comentario.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", usersRoutes);
app.use("/api", proyectosRoutes);
app.use("/api", presupuestosRoutes);
app.use("/api", avancesRoutes);
app.use("/api", reportesRoutes);
app.use("/api", detalleRoutes);
app.use("/api/avances-cliente", avancesClienteRoutes);
app.use("/api/comentarios", comentarioRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

export default app;