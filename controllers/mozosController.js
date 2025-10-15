const mozosService = require('../services/mozosService');
const { format } = require('date-fns/format');

const emitirMozosActualizados = async (req) => {
    if (req.io) {
        try {
            const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const data = await mozosService.getRegistros();
            req.io.to('mozos-room').emit('mozos-actualizados', data);
            console.log(fecha, 'mozos-room: datos actualizados');
        } catch (error) {
            console.error('emitirMozosActualizados:', error);
        }
    }
}

const mozosController = {
    async getMozos(req, res) {
        try {
            const data = await mozosService.getRegistros();

            res.status(200).json(data);
        } catch (error) {
            console.error('getMozos:', error);
            res.status(500).json({ error: 'Error al obtener mozos' });
        }
    },

    async getHistorial(req, res) {
        try {
            const { fi, ff } = req.params;
            const data = await mozosService.getHistorial(fi, ff);

            res.status(200).json(data);
        } catch (error) {
            console.error('getHistorial:', error);
            res.status(500).json({ error: 'Error al obtener historial de mozos' });
        }
    },

    async crearMozo(req, res) {
        try {
            const { dni, mozo, direccion, telefono } = req.body;
            if (!mozo) {
                res.status(400).json({ error: 'El campo nombre es necesario' });
            }

            await mozosService.crearRegistro({ dni, mozo, direccion, telefono });

            await emitirMozosActualizados(req);

            res.status(200).json({ error: 'Mozo creado' });
        } catch (error) {
            console.error('crearMozo:', error);
            res.status(500).json({ error: 'Error al crear mozo' });
        }
    },

    async actualizarMozo(req, res) {
        try {
            const { id } = req.params;
            const { dni, mozo, direccion, telefono } = req.body;

            if (!mozo) {
                req.status(400).json({ error: 'El campo nombre es necesario' });
            }

            await mozosService.actualizarRegistro(id, { dni, mozo, direccion, telefono });

            await emitirMozosActualizados(req);

            res.status(200).json({ message: 'Mozo actualizado' });
        } catch (error) {
            console.error('actualizarMozo:', error);
            res.status(500).json({ error: 'Error al actualizar mozo' });
        }
    },

    async eliminarMozo(req, res) {
        try {
            const { id } = req.params;

            await mozosService.eliminarRegistro(id);

            await emitirMozosActualizados(req);

            res.status(200).json({ message: 'Mozo eliminado' });
        } catch (error) {
            console.error('eliminarMozo:', error);
            res.status(500).json({ error: 'Error al eliminar mozo' });
        }
    },

    async subirMozo(req, res) {
        try {
            const { id } = req.params;

            await mozosService.subirOrden(id);

            await emitirMozosActualizados(req);

            res.status(200).json({ message: 'Mozo subió de orden' });
        } catch (error) {
            console.error('subirMozo:', error);
            res.status(500).json({ error: 'Error al subir orden de mozo' });
        }
    },

    async bajarMozo(req, res) {
        try {
            const { id } = req.params;

            await mozosService.bajarOrden(id);

            await emitirMozosActualizados(req);

            res.status(200).json({ mesage: 'Mozo bajó de orden' });
        } catch (error) {
            console.error('bajarMozo:', error);
            res.status(500).json({ error: 'Error al bajar orden de mozo' });
        }
    },
};

module.exports = mozosController;