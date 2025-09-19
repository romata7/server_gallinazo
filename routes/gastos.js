const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.post("/gastos", async (req, res) => {
  const { cant, concepto, costo } = req.body.gasto;
  try {
    const [result] = await database.query("CALL agregar_reg_gasto (?, ?, ?)", [
      cant,
      concepto,
      costo,
    ]);
    res.json(result[0][0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ last_id_reg_gasto: 0 });
  }
});

router.put("/gastos", async (req, res) => {
  const { id_reg_gasto, cant, concepto, costo } = req.body.gasto;
  try {
    const [result] = await database.query(
      "CALL modificar_reg_gasto (?, ?, ?, ?)",
      [id_reg_gasto, cant, concepto, costo]
    );
    res.json(result[0][0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ last_id_reg_gasto: 0 });
  }
});
router.delete("/gastos/:id_reg_gasto", async (req, res) => {
  console.log(req.params);
  const { id_reg_gasto } = req.params;
  try {
    const [result] = await database.query("CALL eliminar_reg_gasto (?)", [
      id_reg_gasto,
    ]);
    res.json(result[0][0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ last_id_reg_gasto: 0 });
  }
});
router.get("/gastos", async (req, res) => {
  const { fi, ff } = req.query;
  try {
    const [result] = await database.query("CALL listar_gastos(?, ?)", [fi, ff]);
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});
router.get("/gastos/all", async (req, res) => {
  const { fi, ff } = req.query;
  try {
    const [result] = await database.query("CALL listar_gastos_all(?, ?)", [fi, ff]);
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});
module.exports = router;
