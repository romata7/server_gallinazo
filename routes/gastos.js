const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');

router.get('/gastos', gastosController.getGastos);
router.post('/gastos', gastosController.craerGasto);
router.put('/gastos/:id', gastosController.actualizarGasto);
router.delete('/gastos/:id', gastosController.eliminarGasto);
router.get('/gastos/historial/:fi/:ff', gastosController.getHistorial);

module.exports = router;