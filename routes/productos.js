const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.get("/productos", async (req, res) => {
  try {
    const [results] = await database.query("CALL listar_productos()");
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

router.get("/productos/all", async (req, res) => {
  try {
    const [response] = await database.query('SELECT * FROM reg_productos')
    res.status(201).json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json([])
  }
})
router.get("/productos/last_id", async (req, res) => {
  try {
    const [response] = await database.query(
      "SELECT MAX(id_reg_producto) AS last_id FROM reg_productos"
    );
    res.status(201).json(response[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(0);
  }
});

router.post("/productos/agregar", async (req, res) => {
  try {
    const [result] = await database.query('CALL agregar_reg_producto(?, ?)', [req.body.producto.producto, req.body.producto.costo]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/productos/modificar", async (req, res) => {
  try {
    const [result] = await database.query('CALL modificar_reg_producto(?, ?, ?)', [
      req.body.producto.id_reg_producto,
      req.body.producto.producto,
      req.body.producto.costo
    ]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/productos/eliminar", async (req, res) => {
  try {
    const [result] = await database.query('CALL eliminar_reg_producto(?)', [req.body.producto.id_reg_producto])
    res.status(200).json(result)
  } catch (error) {
    console.error(error);
    res.status(500).json(error)
  }

})

router.post('/productos/subir', async (req, res) => {
  console.log(req.body)
  try {
    res.status(200).json({ ok: ok })
  } catch (error) {
    res.status(500).json(error)
  }
})

router.post('/productos', async (req, res) => {
  console.log(req.body);
  console.log('xxx')
  try {
    const response = await database.query('select * from productos')
    console.log('response:', response);
  } catch (error) {

  }
})

module.exports = router;