const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.get("/clientes", async (req, res) => {
  try {
    const [results] = await database.query("CALL listar_clientes()");
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

router.get("/clientes/all", async (req, res) => {
  try {
    const [response] = await database.query('SELECT * FROM reg_clientes')
    res.status(201).json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json([])
  }
})
router.get("/clientes/last_id", async (req, res) => {
  try {
    const [response] = await database.query(
      "SELECT MAX(id_reg_cliente) AS last_id FROM reg_clientes"
    );
    res.status(201).json(response[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(0);
  }
});

router.post("/clientes/agregar", async (req, res) => {
  try {
    const [result] = await database.query('CALL agregar_reg_cliente(?)', [req.body.cliente.cliente]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/clientes/modificar", async (req, res) => {
  try {
    const [result] = await database.query('CALL modificar_reg_cliente(?, ?)', [
      req.body.cliente.id_reg_cliente,
      req.body.cliente.cliente,      
    ]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/clientes/eliminar", async (req, res) => {
  try {
    const [result] = await database.query('CALL eliminar_reg_cliente(?)', [req.body.cliente.id_reg_cliente])
    res.status(200).json(result)
  } catch (error) {
    console.error(error);
    res.status(500).json(error)
  }

})


module.exports = router;