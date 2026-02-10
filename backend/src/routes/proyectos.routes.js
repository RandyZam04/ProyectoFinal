import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/* Creación de proyectos */
router.post("/proyectos", async (req, res) => {
  const { nombre, descripcion, id_cliente, id_responsable, estado, fecha_inicio, fecha_fin } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO proyectos (nombre, descripcion, id_cliente, id_responsable, estado, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, id_cliente, id_responsable, estado, fecha_inicio, fecha_fin]
    );
    res.status(201).json({ message: "Proyecto creado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear proyecto" });
  }
});

/* Listar proyectos según rol */
router.get("/proyectos/:userId/:admin", async (req, res) => {
  const { userId, admin } = req.params;
  try {
    let query;
    let params;
    
    if (admin === "1") {
      query = `
        SELECT 
          p.*, 
          u.nombre AS cliente,
          COALESCE(pre.total, 0) AS presupuesto
        FROM proyectos p 
        JOIN usuarios u ON p.id_cliente = u.idusuarios
        LEFT JOIN presupuesto pre ON p.idproyectos = pre.id_proyecto`;
      params = [];
    } else {
      query = `
        SELECT 
          p.*, 
          u.nombre AS cliente,
          COALESCE(pre.total, 0) AS presupuesto
        FROM proyectos p 
        JOIN usuarios u ON p.id_cliente = u.idusuarios 
        LEFT JOIN presupuesto pre ON p.idproyectos = pre.id_proyecto
        WHERE p.id_cliente = ?`;
      params = [userId];
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error en SQL:", error);
    res.status(500).json({ message: "Error al obtener proyectos" });
  }
});

export default router;