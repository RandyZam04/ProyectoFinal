import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/proyecto/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(
            "SELECT idavances, descripcion, fecha, adjuntos_urls, tipo FROM avances WHERE id_proyecto = ? ORDER BY fecha DESC",
            [id]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error detallado en el servidor:", error);
        res.status(500).json({ 
            message: "Error al consultar la base de datos",
            error: error.message 
        });
    }
});

export default router;