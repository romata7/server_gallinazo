const BaseService = require('./baseService');

class GastosService extends BaseService {
    constructor() {
        super('gastos', 'gastos_historial');
    }
}

module.exports = new GastosService();