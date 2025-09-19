const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.get("/resumen/productos_vendidos", async (req, res) => {
  try {
    const [result] = await database.query(
      "CALL contar_productos_vendidos(?, ?)",
      [req.query.fi, req.query.ff]
    );
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

router.get("/resumen/productos_x_mozo", async (req, res) => {
  try {
    const [result] = await database.query("CALL productos_x_mozo(?, ?)", [
      req.query.fi,
      req.query.ff,
    ]);
    const array1 = result[0];
    let array2 = [];
    for (const el of array1) {
      const {
        mozo,
        id_comanda,
        total,
        fecha,
        mesa,
        cliente,
        notas_comanda,
        tipo_pago,
        origen,
        ...resto
      } = el;
      if (!array2[mozo]) {
        array2[mozo] = [];
      }

      if (!array2[mozo][id_comanda]) {
        array2[mozo][id_comanda] = {
          id_comanda,
          tipo_pago,
          total,
          fecha,
          mesa,
          cliente,
          notas_comanda,
          origen,
          datos: [],
        };
      }
      array2[mozo][id_comanda].datos.push(resto);
    }
    const resultArray = Object.entries(array2).map(([mozo, comandas]) => ({
      mozo,
      datos: Object.values(comandas),
    }));

    res.status(201).json(resultArray);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

module.exports = router;
