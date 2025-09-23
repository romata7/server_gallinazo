const express = require("express");
const router = express.Router();
const database = require("../models/database");

router.get("/productos", async (req, res) => {
  try {
    const [productos] = await database.query('SELECT * FROM productos');
    const [productos_historial] = await database.query('SELECT * FROM productos_historial');
    res.status(200).json({ productos, productos_historial });
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

const getMaxOrden = async () => {
  const [result] = await database.query('SELECT MAX(orden) AS max_orden FROM productos');
  return result[0].max_orden || 0;
}

const getProximoMenor = async (orden) => {
  const [result] = await database.query('SELECT id, orden FROM productos WHERE orden < ? ORDER BY orden DESC LIMIT 1', [orden]);
  return result.length > 0 ? result[0] : null;
}

const getProximoMayor = async (orden) => {
  const [result] = await database.query('SELECT id, orden FROM productos WHERE orden > ? ORDER BY orden ASC LIMIT 1', [orden]);
  return result.length > 0 ? result[0] : null;
}

router.post('/productos', async (req, res) => {
  const { producto, costo } = req.body;
  try {
    if (producto !== "" && costo > 0) {
      const maxOrden = await getMaxOrden();
      const nuevoOrden = maxOrden + 1;
      const [result] = await database.query('INSERT INTO productos (producto, costo, orden) VALUES(?, ?, ?)', [producto, costo, nuevoOrden]);
      const nuevoId = result.insertId;
      await database.query('INSERT INTO productos_historial (operacion, id_producto, producto, costo, orden) VALUES(?, ?, ?, ?, ?)', ['AGREGADO', nuevoId, producto, costo, nuevoOrden]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    const [productos] = await database.query('SELECT * FROM productos');
    const [productos_historial] = await database.query('SELECT * FROM productos_historial');
    return res.status(200).json({ productos, productos_historial });
  }
});
router.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { producto, costo, orden } = req.body;
  try {
    if (producto !== "" && costo > 0) {
      await database.query('UPDATE productos SET producto = ?, costo = ?, orden = ? WHERE id = ?', [producto, costo, orden, id]);
      await database.query('INSERT INTO productos_historial (operacion, id_producto, producto, costo, orden) VALUES (?, ?, ?, ?, ?)', ['MODIFICADO', id, producto, costo, orden]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    const [productos] = await database.query('SELECT * FROM productos');
    const [productos_historial] = await database.query('SELECT * FROM productos_historial');
    return res.status(200).json({ productos, productos_historial });
  }
});

router.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (id > 0) {
      const [findProduct] = await database.query('SELECT * FROM productos WHERE id = ?', [id])
      if (findProduct[0]) {
        const { id, producto, costo, orden } = findProduct[0];
        await database.query('DELETE FROM productos WHERE id = ?', [id]);
        await database.query('INSERT INTO productos_historial (operacion, id_producto, producto, costo, orden) VALUES (?, ?, ?, ?, ?)', ['ELIMINADO', id, producto, costo, orden]);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    const [productos] = await database.query('SELECT * FROM productos');
    const [productos_historial] = await database.query('SELECT * FROM productos_historial');
    return res.status(200).json({ productos, productos_historial });
  }
});

router.post('/productos/subir', async (req, res) => {
  console.log(req.body)
  try {
    res.status(200).json({ ok: ok })
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router;