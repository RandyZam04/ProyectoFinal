import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/avance/:id_avance", async (req, res) => {
  const { id_avance } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM comentario WHERE id_avance = ? ORDER BY fecha DESC",
      [id_avance]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ error: "Error al cargar comentarios del avance" });
  }
});

router.post("/publicar", async (req, res) => {
  const { id_proyecto, id_usuario, id_avance, contenido } = req.body;

  if (!id_proyecto || !id_usuario || !id_avance || !contenido) {
    return res.status(400).json({ error: "Faltan datos obligatorios (id_avance es requerido)" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO comentario (id_proyecto, id_usuario, id_avance, contenido, fecha) VALUES (?, ?, ?, ?, NOW())",
      [id_proyecto, id_usuario, id_avance, contenido]
    );

    res.json({
      idcomentario: result.insertId,
      message: "Comentario enviado con éxito",
      fecha: new Date()
    });
  } catch (error) {
    console.error("Error al insertar comentario:", error);
    res.status(500).json({ error: "No se pudo guardar el comentario" });
  }
});

export default router;