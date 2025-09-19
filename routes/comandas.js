const express = require("express");
const router = express.Router();
const database = require("../models/database");
const moment = require("moment");

// Agregar Comanda
router.get("/comandas/activas", async (req, res) => {
  const fi =
    req.query.fi || moment().startOf("month").format("YYYY-MM-DDTHH:mm");
  const ff = req.query.ff || moment().endOf("month").format("YYYY-MM-DDTHH:mm");
  try {
    const [results] = await database.query(
      "CALL listar_comandas_activas(?, ?)",
      [fi, ff]
    );
    const comandas = results[0];

    if (!results || results.length === 0 || !results[0]) {
      return res.json([]);
    }

    // Verificar si hay resultados
    if (!comandas || comandas.length === 0) {
      return res.json([]);
    }

    // Agrupar ítems por comanda en un Map
    var comandasConItems = comandas.reduce((acc, comanda) => {
      const {
        id_reg_item,
        cant,
        producto,
        costo,
        notas_producto,
        id_comanda,
        ...comandaData
      } = comanda;
      if (!acc.has(id_comanda)) {
        acc.set(id_comanda, {
          id_comanda,
          ...comandaData,
          items: [],
        });
      }

      acc.get(id_comanda).items.push({
        id_reg_item,
        cant,
        producto,
        costo,
        notas_producto,
      });
      return acc;
    }, new Map());
    res.json(Array.from(comandasConItems.values())); // Enviar todas las comandas activas con sus ítems
  } catch (error) {
    console.error("Error en listar comandas activas:", error.message);
    res.status(500).json({
      error: "Error al listar las comandas activas",
      details: error.message,
    });
  }
});

router.post("/comandas/agregar", async (req, res) => {
  const { reg_datos, items } = req.body;
  //comenzar transacción
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    //agregar registro de datos
    await connection.query(
      "CALL agregar_reg_dato(?, ?, ?, ?, ?, ?, @last_id_reg_dato)",
      [
        reg_datos.mesa,
        reg_datos.cliente,
        reg_datos.mozo,
        reg_datos.total,
        reg_datos.tipo_pago,
        reg_datos.notas_comanda,
      ]
    );
    const [result] = await connection.query("SELECT @last_id_reg_dato");
    const last_id_reg_dato = result[0]["@last_id_reg_dato"];

    //agregar comanda
    await connection.query("CALL agregar_comanda(?, @last_id_comanda)", [
      last_id_reg_dato,
    ]);
    const [comandaResult] = await connection.query("SELECT @last_id_comanda");
    const last_id_comanda = comandaResult[0]["@last_id_comanda"];

    //agregar items
    for (const item of items) {
      await connection.query(
        "CALL agregar_reg_item(?, ?, ?, ?, @last_id_reg_item)",
        [item.cant, item.producto, item.costo, item.notas_producto]
      );
      const [itemResult] = await connection.query("SELECT @last_id_reg_item");
      const last_id_reg_item = itemResult[0]["@last_id_reg_item"];
      await connection.query("CALL agregar_item(?, ?)", [
        last_id_comanda,
        last_id_reg_item,
      ]);
    }
    await connection.commit();
    res
      .status(201)
      .json({ message: "Comanda registrada exitosamente", last_id_comanda });
  } catch (error) {
    await connection.rollback();
    console.error("Error al registrar comanda:", error);
    res
      .status(500)
      .json({ error: "Error al registrar comanda", details: error.message });
  } finally {
    connection.release();
  }
});

router.get("/comandas/last_id", async (req, res) => {
  try {
    const [response] = await database.query(
      "SELECT MAX(id_comanda) AS last_id FROM comandas"
    );
    res.status(201).json(response[0]);
  } catch (error) {
    console.error(error);
  }
});

router.post("/comandas/modificar", async (req, res) => {
  let { reg_datos, items } = req.body;
  const { id_comanda, ...resto } = reg_datos;
  reg_datos = resto;
  //comenzar transacción
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    //agregar registro de datos
    await connection.query(
      "CALL agregar_reg_dato(?, ?, ?, ?, ?, ?, @last_id_reg_dato)",
      [
        reg_datos.mesa,
        reg_datos.cliente,
        reg_datos.mozo,
        reg_datos.total,
        reg_datos.tipo_pago,
        reg_datos.notas_comanda,
      ]
    );
    const [result] = await connection.query("SELECT @last_id_reg_dato");
    const last_id_reg_dato = result[0]["@last_id_reg_dato"];

    //modificar comanda
    await connection.query("CALL modificar_comanda(?,?,@last_id_comanda)", [
      last_id_reg_dato,
      id_comanda,
    ]);
    const [comandaResult] = await connection.query("SELECT @last_id_comanda");
    const last_id_comanda = comandaResult[0]["@last_id_comanda"];

    //agregar items
    for (const item of items) {
      await connection.query(
        "CALL agregar_reg_item(?, ?, ?, ?, @last_id_reg_item)",
        [item.cant, item.producto, item.costo, item.notas_producto]
      );
      const [itemResult] = await connection.query("SELECT @last_id_reg_item");
      const last_id_reg_item = itemResult[0]["@last_id_reg_item"];
      await connection.query("CALL agregar_item(?, ?)", [
        last_id_comanda,
        last_id_reg_item,
      ]);
    }
    await connection.commit();
    res
      .status(201)
      .json({ message: "Comanda modificada exitosamente", last_id_comanda });
  } catch (error) {
    await connection.rollback();
    console.error("Error al modificar comanda:", error);
    res
      .status(500)
      .json({ error: "Error al modificar comanda", details: error.message });
  } finally {
    connection.release();
  }
});

router.post("/comandas/eliminar", async (req, res) => {
  const { reg_datos } = req.body;

  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();

    // Llamar al procedimiento para eliminar la comanda
    await connection.query("CALL eliminar_comanda(?)", [reg_datos.id_comanda]);

    await connection.commit();
    res.status(201).json({ message: "Comanda eliminada exitosamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar comanda:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar comanda", details: error.message });
  } finally {
    connection.release();
  }
});

router.get("/comandas", async (req, res) => {
  const { fi, ff } = req.query;
  try {
    const [results] = await database.query(
      "call listar_comandas_x_fechas(?, ?)",
      [fi, ff]
    );
    const comandas = results[0];

    if (!results || results.length === 0 || !results[0]) {
      return res.json([]);
    }

    // Verificar si hay resultados
    if (!comandas || comandas.length === 0) {
      return res.json([]);
    }
    // Agrupar ítems por comanda en un Map
    var comandasConItems = comandas.reduce((acc, comanda) => {
      const {
        id_reg_item,
        cant,
        producto,
        costo,
        notas_producto,
        id_comanda,
        ...comandaData
      } = comanda;
      if (!acc.has(id_comanda)) {
        acc.set(id_comanda, {
          id_comanda,
          ...comandaData,
          items: [],
        });
      }

      acc.get(id_comanda).items.push({
        id_reg_item,
        cant,
        producto,
        costo,
        notas_producto,
      });
      return acc;
    }, new Map());
    res.json(Array.from(comandasConItems.values()));
  } catch (error) {
    console.error("Error en listar comandas x fechas:", error.message);
    res.status(500).json({
      error: "Error al listar las comandas x fechas",
      details: error.message,
    });
  }
});

module.exports = router;
