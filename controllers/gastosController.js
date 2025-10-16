const gastosService = require('../services/gastosService');
const { format } = require('date-fns/format');

const emitirGastosActualizados = async (req) => {
    if (req.io) {
        try {
            const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const data = await gastosService.getRegistros();
            req.io.to('gastos-room').emit('gastos-actualizados', data);
            console.log(fecha, 'gastos-room: datos actualizados');
        } catch (error) {
            console.error('emitirGastosActualizados:', error);
        }
    }
}

const gastosController = {
    async getGastos(req, res) {
        try {
            const data = await gastosService.getRegistros();
            res.status(200).json(data);
        } catch (error) {
            console.error('getGastos:', error);
            res.status(500).json({ error: 'Error al obtener gastos' });
        }
    },

    async getHistorial(req, res) {
        try {
            const { fi, ff } = req.params;
            const data = await gastosService.getHistorial(fi, ff);
            res.status(200).json(data);
        } catch (error) {
            console.error('getHistorial:', error);
            res.status(500).json({ error: 'Error al obtener historial de gastos' });
        }
    },

    async craerGasto(req, res) {
        try {
            const { gasto, detalles, costo } = req.body;
            if (!gasto) {
                res.status(400).json({ error: 'El campo gasto es necesario' });
            }
            await gastosService.crearRegistro({ gasto, detalles, costo });

            await emitirGastosActualizados(req);

            res.status(200).json({ message: 'Gastos creado' });
        } catch (error) {
            console.error('crearGastoo:', error);
            res.status(500).json({ error: 'Error al crear gasto' });
        }
    },

    async actualizarGasto(req, res) {
        try {
            const { id } = req.params;
            const { gasto, detalles, costo } = req.body;

            if (!gasto) {
                res.status(400).json({ error: 'El campo gasto es necesario' });
            }

            await gastosService.actualizarRegistro(id, { gasto, detalles, costo });

            await emitirGastosActualizados(req);

            res.status(200).json({ message: 'Gasto actualizado' });
        } catch (error) {
            console.error('actualizarGasto:', error);
            res.status(500).json({ error: 'Error al actualizar gasto' });
        }
    },

    async eliminarGasto(req, res) {
        try {
            const { id } = req.params;

            await gastosService.eliminarRegistro(id),

                await emitirGastosActualizados(req);

            res.status(200).json({ message: 'Gasto eliminado' });
        } catch (error) {
            console.error('eliminarGasto:', error);
            res.status(500).json({ error: 'Error al eliminar gasto' });
        }
    },
}

module.exports = gastosController;