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
      query = `SELECT p.*, u.nombre AS cliente FROM proyectos p JOIN usuarios u ON p.id_cliente = u.idusuarios`;
      params = [];
    } else {
      query = `SELECT p.*, u.nombre AS cliente FROM proyectos p JOIN usuarios u ON p.id_cliente = u.idusuarios WHERE p.id_cliente = ?`;
      params = [userId];
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener proyectos" });
  }
});

/* NUEVA RUTA: Obtener detalle de un solo proyecto por ID */
router.get("/proyectos_detalle/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM proyectos WHERE idproyectos = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    res.json(rows[0]); // Devolvemos solo el primer resultado (el objeto del proyecto)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener detalles del proyecto" });
  }
});

export default router;