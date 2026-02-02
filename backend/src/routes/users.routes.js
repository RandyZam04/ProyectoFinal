import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/usuarios", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM usuarios");
  res.json(rows);
});

router.post("/usuarios", async (req, res) => {
  const { nombre, email } = req.body;

  const [result] = await pool.query(
    "INSERT INTO usuarios (nombre, email) VALUES (?, ?)",
    [nombre, email]
  );

  res.json({
    id: result.insertId,
    nombre,
    email
  });
});

export default router;