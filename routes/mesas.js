const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.get("/mesas", async (req, res) => {
  try {
    const [results] = await database.query("CALL listar_mesas()");
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

router.get("/mesas/all", async (req, res) => {
  try {
    const [response] = await database.query('SELECT * FROM reg_mesas')
    res.status(201).json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json([])
  }
})
router.get("/mesas/last_id", async (req, res) => {
  try {
    const [response] = await database.query(
      "SELECT MAX(id_reg_mesa) AS last_id FROM reg_mesas"
    );
    res.status(201).json(response[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(0);
  }
});

router.post("/mesas/agregar", async (req, res) => {
  try {
    const [result] = await database.query('CALL agregar_reg_mesa(?)', [req.body.mesa.mesa]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/mesas/modificar", async (req, res) => {
  try {
    const [result] = await database.query('CALL modificar_reg_mesa(?, ?)', [
      req.body.mesa.id_reg_mesa,
      req.body.mesa.mesa,      
    ]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/mesas/eliminar", async (req, res) => {
  try {
    const [result] = await database.query('CALL eliminar_reg_mesa(?)', [req.body.mesa.id_reg_mesa])
    res.status(200).json(result)
  } catch (error) {
    console.error(error);
    res.status(500).json(error)
  }

})


module.exports = router;