const express = require('express');
const router = express.Router();
const mozosController = require('../controllers/mozosController');

router.get('/mozos', mozosController.getMozos);
router.post('/mozos', mozosController.crearMozo);
router.put('/mozos/:id', mozosController.actualizarMozo);
router.delete('/mozos/:id', mozosController.eliminarMozo);
router.post('/mozos/subir/:id', mozosController.subirMozo);
router.post('/mozos/bajar/:id', mozosController.bajarMozo);
router.get('/mozos/historial/:fi/:ff', mozosController.getHistorial);

module.exports = router;