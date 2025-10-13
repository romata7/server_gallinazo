const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/productos', productosController.obtenerProductos);
router.post('/productos', productosController.crearProducto);
router.put('/productos/:id', productosController.actualizarProducto);
router.delete('/productos/:id', productosController.eliminarProducto);
router.post('/productos/subir/:id', productosController.subirProducto);
router.post('/productos/bajar/:id', productosController.bajarProducto);
router.post('/productos/historial/:fi/:ff', productosController.getHistorial);

module.exports = router;