import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/reportes/inversion-global", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT SUM(total) AS inversionGlobal FROM presupuesto");
    res.json({ inversionGlobal: rows[0].inversionGlobal || 0 });
  } catch (error) {
    console.error("Error en inversion-global:", error);
    res.status(500).json({ message: "Error interno" });
  }
});

router.get("/reportes/gastos-por-categoria", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COALESCE(r.nombre, 'Sin Nombre') AS categoria, 
        SUM(gr.monto_gastado) AS gastoTotal 
      FROM gastos_rubros gr 
      LEFT JOIN rubros r ON gr.id_rubro = r.idrubros 
      GROUP BY categoria
    `); 
    res.json(rows);
  } catch (error) {
    console.error("Error en gráfico:", error);
    res.json([]); 
  }
});

router.get("/reportes/resumen-financiero", async (req, res) => {
  try {
    const [p] = await pool.query("SELECT COUNT(*) AS count FROM proyectos WHERE estado = 1");
    const [pre] = await pool.query("SELECT SUM(total) AS sum FROM presupuesto");
    
    const [gas] = await pool.query("SELECT SUM(monto_gastado) AS sum FROM gastos_rubros");

    const totalPresupuesto = parseFloat(pre[0].sum) || 0;
    const totalGasto = parseFloat(gas[0].sum) || 0;

    res.json({
      proyectosActivos: p[0].count,
      utilidadProyectada: totalPresupuesto - totalGasto,
      gastosTotales: totalGasto
    });
  } catch (error) {
    res.status(500).json({ proyectosActivos: 0, utilidadProyectada: 0, gastosTotales: 0 });
  }
});

export default router;