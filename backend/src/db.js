import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.getConnection()
  .then(conn => {
    console.log("✅ Conectado a Clever Cloud: " + process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error("❌ Error de conexión Cloud:", err.message);
  });
