const BaseService = require('./baseService');

class ClientesService extends BaseService {
    constructor() {
        super('clientes', 'clientes_historial', 'name');
    }

    async buscarPorDniRuc(dniruc) {
        const db = require('../models/database');
        return await db.findOne(
            'SELECT * FROM clientes WHERE dniruc = ?',
            [dniruc]
        );
    }
}

module.exports = new ClientesService();