import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ? AND activo = 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json({
      id: user.idusuarios,
      nombre: user.nombre,
      email: user.email,
      admin: user.admin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idusuarios, nombre, email, admin FROM usuarios"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

router.post("/usuarios/registro", async (req, res) => {
  const { nombre, email, password, admin } = req.body;

  try {
    const [existente] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    
    if (existente.length > 0) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, admin, activo, created_at) VALUES (?, ?, ?, ?, 1, NOW())",
      [nombre, email, hashedPassword, admin || 0]
    );
    
    res.status(201).json({ 
      mensaje: "Usuario creado con éxito", 
      id: result.insertId 
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

export default router;