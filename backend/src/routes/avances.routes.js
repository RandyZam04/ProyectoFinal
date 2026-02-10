import { Router } from "express";
import multer from "multer";
import cloudinary from "../../cloudinaryConfig.js"; 
import { pool } from "../db.js";
import fs from "fs";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get("/seccion-avances/:id_proyecto", async (req, res) => {
  const { id_proyecto } = req.params;
  try {
    const query = `
      SELECT a.*, gr.monto_gastado, gr.id_rubro
      FROM avances a
      LEFT JOIN gastos_rubros gr ON a.idgastos = gr.idgastos
      WHERE a.id_proyecto = ?
      ORDER BY a.fecha DESC
    `;
    const [rows] = await pool.query(query, [id_proyecto]);
    res.json(rows);
  } catch (error) {
    console.error("Error en SQL:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

router.post("/publicar-avance", upload.array("files"), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { descripcion, monto, id_rubro, id_proyecto, tipo, porcentaje } = req.body;
    const files = req.files || [];

    await connection.beginTransaction();

    const promesas = files.map(file => {
      const extension = path.extname(file.originalname).toLowerCase();
      const esDoc = [".pdf", ".doc", ".docx", ".xls", ".xlsx"].includes(extension);

      return cloudinary.uploader.upload(file.path, { 
        folder: `proyecto_${id_proyecto}/avances`,
        resource_type: esDoc ? "raw" : "image", 
        use_filename: true
      });
    });
    
    const resultados = await Promise.all(promesas);
    
    const urlsString = resultados.map(r => r.secure_url).join(',');

    files.forEach(file => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });

    let idGastoCreado = null;
    const idRubroNumerico = parseInt(id_rubro);
    if (!isNaN(idRubroNumerico) && idRubroNumerico > 0) {
      const [resGasto] = await connection.query(
        "INSERT INTO gastos_rubros (id_proyecto, id_rubro, monto_gastado, fecha, descripcion) VALUES (?, ?, ?, NOW(), ?)",
        [id_proyecto, idRubroNumerico, parseFloat(monto) || 0, descripcion]
      );
      idGastoCreado = resGasto.insertId;
    }

    const [resAvance] = await connection.query(
      "INSERT INTO avances (id_proyecto, porcentaje, descripcion, fecha, tipo, idgastos, adjuntos_urls) VALUES (?, ?, ?, NOW(), ?, ?, ?)",
      [id_proyecto, porcentaje || 0, descripcion, tipo || "Avance", idGastoCreado, urlsString]
    );

    await connection.commit();
    res.json({ idavances: resAvance.insertId, urls: urlsString.split(',') });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

export default router;