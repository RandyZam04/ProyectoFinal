import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(authRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.use(usersRoutes);

export default app;