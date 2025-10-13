const BaseService = require('./baseService');

class TipopagosService extends BaseService {
    constructor() {
        super('tipopagos', 'tipopagos_historial');
    }
};

module.exports = new TipopagosService();