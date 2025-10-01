const express = require("express");
const router = express.Router();
const database = require("../models/database");
const { format } = require("date-fns/format");

const getMaxOrden = async () => {
  const [result] = await database.query('SELECT MAX(orden) AS max_orden FROM clientes');
  return result[0].max_orden || 0;
};

const obtenerClientesActualizados = async () => {
  const today = new Date();
  const fi = format(today, 'yyyy-MM-dd');
  const ff = format(today, 'yyyy-MM-dd');
  const fi_ = `${fi} 00:00:00`
  const ff_ = `${ff} 23:59:59`
  let clientes = [];
  let clientes_historial = [];
  try {
    [clientes] = await database.query('SELECT * FROM clientes ORDER BY orden');
    [clientes_historial] = await database.query('SELECT * FROM clientes_historial WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC', [fi_, ff_]);
  } catch (error) {
    console.error(error);
  }
  return { clientes, clientes_historial };
};

const emitirActualizacionesClientes = async (req) => {
  if (req.io) {
    try {
      const data = await obtenerClientesActualizados();
      req.io.to('clientes-room').emit('clientes-actualizados', data);
      console.log('Actualización de clientes emitida');
    } catch (error) {
      console.error(error);
    }
  }
}
router.get('/clientes', async (req, res) => {
  try {
    const data = await obtenerClientesActualizados();
    res.status(200).json(data)
  } catch (error) {
    console.error(error);
    res.status(500).json([])
  }
})

router.post('/clientes', async (req, res) => {
  const { dniruc, name, address, phone } = req.body;
  try {
    if (name !== "") {
      const maxOrden = await getMaxOrden();
      const nuevoMaxOrden = maxOrden + 1;
      const [result] = await database.query('INSERT INTO clientes (dniruc, name, address, phone, orden) VALUES(?, ?, ?, ?, ?)', [dniruc, name, address, phone, nuevoMaxOrden]);
      const nuevoId = result.insertId;
      const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      await database.query('INSERT INTO clientes_historial(operacion, id_cliente, dniruc, name, address, phone, orden, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['AGREGADO', nuevoId, dniruc, name, address, phone, nuevoMaxOrden, fecha]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    const data = await obtenerClientesActualizados();
    // Emitir actualización
    await emitirActualizacionesClientes(req);
    return res.status(200).json(data);
  }
});


module.exports = router;