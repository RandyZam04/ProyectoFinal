import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, admin FROM usuarios WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos",
      });
    }

    res.json({
      message: "Login correcto",
      user: rows[0], // incluye admin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error del servidor",
    });
  }
});

export default router;