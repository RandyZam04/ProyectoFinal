import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/presupuestos/proyecto/:id_proyecto", async (req, res) => {
  try {
    const [presupuesto] = await pool.query(
      "SELECT * FROM presupuesto WHERE id_proyecto = ?",
      [req.params.id_proyecto]
    );

    if (presupuesto.length === 0) {
      return res.status(404).json({ message: "No hay presupuesto aún" });
    }

    const [rubros] = await pool.query(
      "SELECT nombre, descripcion, costo as monto FROM rubros WHERE idpresupuesto = ?",
      [presupuesto[0].idpresupuesto]
    );

    res.json({
      ...presupuesto[0],
      rubros: rubros
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener datos" });
  }
});

router.post("/presupuestos", async (req, res) => {
  const { id_proyecto, total, estado, fecha, rubros } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM rubros WHERE idpresupuesto IN (SELECT idpresupuesto FROM presupuesto WHERE id_proyecto = ?)", [id_proyecto]);
    await connection.query("DELETE FROM presupuesto WHERE id_proyecto = ?", [id_proyecto]);

    const [presupuestoResult] = await connection.query(
      "INSERT INTO presupuesto (id_proyecto, total, estado, fecha) VALUES (?, ?, ?, ?)",
      [id_proyecto, total, estado, fecha]
    );

    const idPresupuestoInsertado = presupuestoResult.insertId;

    const rubrosValues = rubros.map(r => [
      idPresupuestoInsertado,
      r.nombre,
      r.descripcion, 
      r.monto
    ]);

    if (rubrosValues.length > 0) {
      await connection.query(
        "INSERT INTO rubros (idpresupuesto, nombre, descripcion, costo) VALUES ?",
        [rubrosValues]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Presupuesto guardado y actualizado" });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Error crítico: No se guardó nada" });
  } finally {
    connection.release();
  }
});

export default router;