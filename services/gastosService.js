const BaseService = require('./baseService');

class GastosService extends BaseService {
    constructor() {
        super('mesas', 'mesas_historial');
    }
}

module.exports = new GastosService();