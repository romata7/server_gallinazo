const BaseService = require('/baseService');

class MesasService extends BaseService {
    constructor() {
        super('mesas', 'mesas_historial', 'mesa');
    }
}

module.exports = new MesasService();