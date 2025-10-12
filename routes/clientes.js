const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/clientes', clientesController.obtenerClientes);
router.post('/clientes', clientesController.crearCliente);
router.put('/clientes/:id', clientesController.actualizarCliente);
router.delete('/clientes/:id', clientesController.eliminarCliente);
router.post('/clientes/subir/:id', clientesController.subirCliente);
router.post('/clientes/bajar/:id', clientesController.bajarCliente);
router.get('/clientes/historial/:fi/:ff', clientesController.getHistorial);

module.exports = router;