const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');


router.get('/productos', productosController.obtenerProductos);
router.post('/productos', productosController.crearProducto);
router.put('/productos/:id', productosController.actualizarProducto);
router.delete('/productos:/id', productosController.eliminarProducto);

module.exports = router;