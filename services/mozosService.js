const BaseService = require('./baseService');

class MozosService extends BaseService{
    constructor(){
        super('mozos', 'mozos_historial');
    }
}

module.exports = new MozosService();