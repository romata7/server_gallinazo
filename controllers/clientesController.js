const clientesService = require('../services/clientesService');
const { format } = require('date-fns/format');

const emitirClientesActualizados = async (req) => {
    if (req.io) {
        try {
            const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            const data = await clientesService.getRegistros();
            req.io.to('clientes-room').emit('clientes-actualizados', data);
            console.log(fecha, 'clientes-room: datos actualizados');
        } catch (error) {
            console.error('emitirClientesActualizados:', error);
        }
    }
}

const clientesController = {
    async obtenerClientes(req, res) {
        try {
            const data = await clientesService.getRegistros();
            res.status(200).json(data);
        } catch (error) {
            console.error('obtenerClientes:', error);
            res.status(500).json({ error: 'Error al obtener clientes' });
        }
    },

    async getHistorial(req, res) {
        try {
            const { fi, ff } = req.params;
            const data = await clientesService.getHistorial(fi, ff);
            res.status(200).json(data);
        } catch (error) {
            console.error('getHistorial:');
            res.status(500).json({ error: 'Error al obtener historial' })
        }
    },

    async crearCliente(req, res) {
        try {
            const { dniruc, cliente, direccion, telefono } = req.body;
            if (!cliente) {
                res.status(400).json({ error: 'El nombre es requerido' });
            }

            await clientesService.crearRegistro({ dniruc, cliente, direccion, telefono });

            await emitirClientesActualizados(req);

            res.status(200).json({ message: 'Cliente creado' });
        } catch (error) {
            console.error('crearCliente:', error);
            res.status(500).json({ error: 'Error al crear cliente' });
        }
    },

    async actualizarCliente(req, res) {
        try {
            const { id } = req.params;
            const { dniruc, cliente, direccion, telefono } = req.body;

            if (!cliente) {
                res.status(400).json({ error: 'El nombre es requerido' });
            }

            await clientesService.actualizarRegistro(id, { dniruc, cliente, direccion, telefono });

            await emitirClientesActualizados(req);

            res.status(200).json({ message: 'Cliente Modificado' });
        } catch (error) {
            console.error('actualizarCliente:', error);
            res.status(500).json({ error: 'Error al actualizar cliente' });
        }
    },

    async eliminarCliente(req, res) {
        try {
            const { id } = req.params;

            await clientesService.eliminarRegistro(id);

            await emitirClientesActualizados(req);

            res.status(200).json({ message: 'Cliente eliminado' });
        } catch (error) {
            console.error('eliminarCliente:', error);
            res.status(500).json({ error: 'Error al eliminar cliente' });
        }
    },

    async subirCliente(req, res) {
        try {
            const { id } = req.params;

            await clientesService.subirOrden(id);

            await emitirClientesActualizados(req);

            res.status(200).json({ message: 'Cliente subió de orden' });
        } catch (error) {
            console.error('subirCliente:', error);
            res.status(500).json({ error: 'Error al subir orden de cliente' });
        }
    },

    async bajarCliente(req, res) {
        try {
            const { id } = req.params;

            await clientesService.bajarOrden(id);

            await emitirClientesActualizados(req);

            res.status(200).json({ message: 'Cliente bajó de orden' });
        } catch (error) {
            console.error('bajarCliente:', error);
            res.status(500).json({ error: 'Error al bajar oden de cliente' });
        }
    }
};

module.exports = clientesController;