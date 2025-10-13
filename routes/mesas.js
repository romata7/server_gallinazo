const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');

router.get('/mesas', mesasController.obtenerMesas);
router.post('/mesas', mesasController.crearMesa);
router.put('/mesas/:id', mesasController.actualizarMesa);
router.delete('/mesas/:id', mesasController.eliminarMesa);
router.post('/mesas/subir/:id', mesasController.subirMesa);
router.post('/mesas/bajar/:id', mesasController.bajarMesa);
router.get('/mesas/historial/:fi/:ff', mesasController.getHistorial);

module.exports = router;