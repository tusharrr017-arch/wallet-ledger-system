const express = require("express");
const pool = require("./config/db");

const app = express();
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS db_ok;");
    return res.status(200).json({
      ok: true,
      message: "Wallet Ledger API running",
      db: rows[0].db_ok === 1 ? "connected" : "not_connected"
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Server running but DB not connected",
      error: err.message
    });
  }
});

module.exports = app;
