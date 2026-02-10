import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/proyecto-individual/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.nombre AS arquitecto 
       FROM proyectos p 
       LEFT JOIN usuarios u ON p.id_responsable = u.idusuarios 
       WHERE p.idproyectos = ?`, 
      [Number(id)]
    );

    if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;