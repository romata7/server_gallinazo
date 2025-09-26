const express = require("express");
const router = express.Router();
const database = require("../models/database");
const { format } = require('date-fns')

const getMaxOrden = async () => {
  const [result] = await database.query('SELECT MAX(orden) AS max_orden FROM productos');
  return result[0].max_orden || 0;
}

const obtenerDatosActualizados = async () => {
  const today = new Date();
  const fi = format(today, 'yyyy-MM-dd');
  const ff = format(today, 'yyyy-MM-dd');
  const fi_ = `${fi} 00:00:00`
  const ff_ = `${ff} 23:59:59`
  let productos = [];
  let productos_historial = [];
  try {
    [productos] = await database.query('SELECT * FROM productos ORDER BY ORDEN');
    [productos_historial] = await database.query('SELECT * FROM productos_historial WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC', [fi_, ff_]);
  } catch (error) {
    console.error(error);
  }
  return { productos, productos_historial };
};

const emitirActualizacionesProductos = async (req) => {
  if (req.io) {
    try {
      const data = await obtenerDatosActualizados();
      req.io.to('productos-room').emit('productos-actualizados', data);
      console.log('Actualización de productos emitida');
    } catch (error) {
      console.error('Error al emitir actualización:', error);
    }
  }
};

router.get("/productos", async (req, res) => {
  try {
    const data = await obtenerDatosActualizados();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

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
    const data = await obtenerDatosActualizados();
    // Emitir actualización
    await emitirActualizacionesProductos(req);
    return res.status(200).json(data);
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
    const data = await obtenerDatosActualizados();
    await emitirActualizacionesProductos(req);
    return res.status(200).json(data);
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
    const data = await obtenerDatosActualizados();
    await emitirActualizacionesProductos(req);
    return res.status(200).json(data);
  }
});

const getProximoMenor = async (orden) => {
  const [result] = await database.query('SELECT * FROM productos WHERE orden < ? ORDER BY orden DESC LIMIT 1', [orden]);
  return result.length > 0 ? result[0] : null;
}

const getProximoMayor = async (orden) => {
  const [result] = await database.query('SELECT * FROM productos WHERE orden > ? ORDER BY orden ASC LIMIT 1', [orden]);
  return result.length > 0 ? result[0] : null;
}

router.post('/productos/subir', async (req, res) => {
  const { id, producto, costo, orden } = req.body.item;
  const menor = await getProximoMenor(orden);
  try {
    if (menor) {
      await database.query('UPDATE productos SET orden = ? WHERE id = ?', [menor.orden, id]);
      await database.query('UPDATE productos SET orden = ? WHERE id = ?', [orden, menor.id]);
      await database.query('INSERT INTO productos_historial (operacion, id_producto, producto, costo, orden) VALUES (?, ?, ?, ?, ?)', ['SUBE', id, producto, costo, menor.orden]);
      await database.query('INSERT INTO productos_historial (operacion, id_producto, producto, costo, orden) VALUES (?, ?, ?, ?, ?)', ['BAJA', menor.id, menor.producto, menor.costo, orden]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    const data = await obtenerDatosActualizados();
    await emitirActualizacionesProductos(req);
    return res.status(200).json(data);
  }
})
router.post('/productos/bajar', async (req, res) => {
  const { id, producto, costo, orden } = req.body.item;
  const mayor = await getProximoMayor(orden);
  try {
    if (mayor) {
      await database.query('UPDATE productos SET orden = ? WHERE id = ?', [mayor.orden, id]);
      await database.query('UPDATE productos SET orden = ? WHERE id = ?', [orden, mayor.id]);
      await database.query('INSERT INTO productos_historial (operacion, id_producto, producto, costo, orden) VALUES (?, ?, ?, ?, ?)', ['BAJA', id, producto, costo, mayor.orden]);
      await database.query('INSERT INTO productos_historial (operacion, id_producto, producto, costo, orden) VALUES (?, ?, ?, ?, ?)', ['SUBE', mayor.id, mayor.producto, mayor.costo, orden]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    const data = await obtenerDatosActualizados();
    await emitirActualizacionesProductos(req);
    return res.status(200).json(data);
  }
})

router.get('/productos/xfechas', async (req, res) => {
  const { fi, ff } = req.query
  const fi_ = `${fi} 00:00:00`
  const ff_ = `${ff} 23:59:59`
  let rows = [];
  try {
    [rows] = await database.query('SELECT * FROM productos_historial WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC', [fi_, ff_]);
  } catch (error) {
    console.error(error);
  } finally {
    return res.status(200).json(rows)
  }
})

module.exports = router;