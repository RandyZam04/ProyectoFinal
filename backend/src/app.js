import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.routes.js";
import proyectosRoutes from "./routes/proyectos.routes.js";
import presupuestosRoutes from "./routes/presupuestos.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", usersRoutes);
app.use("/api", proyectosRoutes);
app.use("/api", presupuestosRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

export default app;