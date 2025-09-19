const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.get("/tipo_pagos", async (req, res) => {
  try {
    const [results] = await database.query("CALL listar_tipo_pagos()");
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

router.get("/tipo_pagos/all", async (req, res) => {
  try {
    const [response] = await database.query('SELECT * FROM reg_tipo_pagos')
    res.status(201).json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json([])
  }
})
router.get("/tipo_pagos/last_id", async (req, res) => {
  try {
    const [response] = await database.query(
      "SELECT MAX(id_reg_tipo_pago) AS last_id FROM reg_tipo_pagos"
    );
    res.status(201).json(response[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(0);
  }
});

router.post("/tipo_pagos/agregar", async (req, res) => {
  try {
    const [result] = await database.query('CALL agregar_reg_tipo_pago(?)', [req.body.tipo_pago.tipo_pago]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/tipo_pagos/modificar", async (req, res) => {
  try {
    const [result] = await database.query('CALL modificar_reg_tipo_pago(?, ?)', [
      req.body.tipo_pago.id_reg_tipo_pago,
      req.body.tipo_pago.tipo_pago,      
    ]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/tipo_pagos/eliminar", async (req, res) => {
  try {
    const [result] = await database.query('CALL eliminar_reg_tipo_pago(?)', [req.body.tipo_pago.id_reg_tipo_pago])
    res.status(200).json(result)
  } catch (error) {
    console.error(error);
    res.status(500).json(error)
  }

})


module.exports = router;