const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.get("/mozos", async (req, res) => {
  try {
    const [results] = await database.query("CALL listar_mozos()");
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

router.get("/mozos/all", async (req, res) => {
  try {
    const [response] = await database.query('SELECT * FROM reg_mozos')
    res.status(201).json(response)
  } catch (error) {
    console.error(error);
    res.status(500).json([])
  }
})
router.get("/mozos/last_id", async (req, res) => {
  try {
    const [response] = await database.query(
      "SELECT MAX(id_reg_mozo) AS last_id FROM reg_mozos"
    );
    res.status(201).json(response[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(0);
  }
});

router.post("/mozos/agregar", async (req, res) => {
  try {
    const [result] = await database.query('CALL agregar_reg_mozo(?)', [req.body.mozo.mozo]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/mozos/modificar", async (req, res) => {
  try {
    const [result] = await database.query('CALL modificar_reg_mozo(?, ?)', [
      req.body.mozo.id_reg_mozo,
      req.body.mozo.mozo,      
    ]);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

router.post("/mozos/eliminar", async (req, res) => {
  try {
    const [result] = await database.query('CALL eliminar_reg_mozo(?)', [req.body.mozo.id_reg_mozo])
    res.status(200).json(result)
  } catch (error) {
    console.error(error);
    res.status(500).json(error)
  }

})


module.exports = router;