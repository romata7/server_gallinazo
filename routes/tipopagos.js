const express = require('express');
const tipopagosController = require('../controllers/tipopagosController');
const router = express.Router();

router.get('/tipopagos', tipopagosController.getTipopagos);
router.post('/tipopagos', tipopagosController.crearTipopago);
router.put('/tipopagos/:id', tipopagosController.actualizarTipopago);
router.delete('/tipopagos/:id', tipopagosController.eliminarTipopago);
router.post('/tipopagos/subir/:id', tipopagosController.subirTipopago);
router.psot('/tipopagos/bajar/:id', tipopagosController.bajarTipopago);
router.get('/tipopagos/historial/:fi/:ff', tipopagosController.getHistorial);

module.exports = router;