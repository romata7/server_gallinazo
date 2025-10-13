const BaseService = require('./baseService');

class ProductosService extends BaseService {
    constructor() {
        super('productos', 'productos_historial');
    }

    // Métpds específicos de productos
    async buscarPorNombre(producto) {
        const db = require('../models/database');
        return await db.findOne(
            'SELECT * FROM productos WHERE producto = ?',
            [producto]
        );
    }

    async productosPorRangoDeCosto(min, max) {
        const db = require('../models/database');
        return await db.query(
            'SELECT * FROM productos WHERE costo BETWEEN ? AND ? ORDER BY costo',
            [min, max]
        );
    }
}

module.exports = new ProductosService();