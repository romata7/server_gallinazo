const { format } = require('date-fns/format');
const mesasService = require('../services/mesasService');

const emitirMesasActualizadas = async (req) => {
    if (req.io) {
        try {
            const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const data = await mesasService.getRegistros();
            req.io.to('mesas-room').emit('mesas-actualizadas', data);
            console.log(fecha, 'mesas-room: datos actualizados');
        } catch (error) {
            console.error('emitirMesasActualizadas:', error);
        }
    }
}

const mesasController = {
    async obtenerMesas(req, res) {
        try {
            const data = await mesasService.getRegistros();
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener clientes' });
        }
    },

    async getHistorial(req, res) {
        try {
            const { fi, ff } = req.params;
            const data = await mesasService.getHistorial(fi, ff);
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener historial' });
        }
    },

    async crearMesa(req, res) {
        try {
            const { mesa } = req.body;
            if (!mesa) {
                res.status(400).json({ error: 'Nombre de mesa es requerido' });
            }

            await mesasService.crearRegistro({ mesa });

            await emitirMesasActualizadas(req);

            res.status(200).json({ message: 'Mesa creada' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear mesa' });
        }
    },

    async actualizarMesa(req, res) {
        try {
            const { id } = req.params;
            const { mesa } = req.body;

            if (!mesa) {
                res.status(400).json({ error: 'Nombre de mesa es requerido' });
            }

            await mesasService.actaulizarRegistro(id, { mesa });

            await emitirMesasActualizadas(req);

            res.status(200).json({ message: 'Mesa modificada' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar mesa' });
        }
    },

    async eliminarMesa(req, res) {
        try {
            const { id } = req.params;

            await mesasService.eliminarRegistro(id);

            await emitirMesasActualizadas(req);

            res.status(200).json({ message: 'Error al eliminar mesa' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar mesa' });
        }
    },

    async subirMesa(req, res) {
        try {
            const { id } = req.params;

            await mesasService.subirOrden(id);

            await emitirMesasActualizadas(req);

            res.status(200).json({ message: 'Mesa subió de orden' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al subir orden de mesa' });
        }
    },

    async bajarMesa(req, res) {
        try {
            const { id } = req.params;

            await mesasService.bajarOrden(id);

            await emitirMesasActualizadas(req);

            res.status(200).json({ message: 'Mesa bajó de orden' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al bajar orden de mesa' });
        }
    }
};

module.exports = mesasController;