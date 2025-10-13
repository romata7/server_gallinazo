const tipopagosService = require('../services/tipopagosService');
const { format } = require('date-fns/format');

const emitirTipopagosActualizados = async (req) => {
    if (req.io) {
        try {
            const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const data = await tipopagosService.getRegistros();
            req.io.to('tipopagos-room').emit('tipopagos-actualizados', data);
            console.log(fecha, 'tipopagos-room: datos actualizados');
        } catch (error) {
            console.error('emitirTipopagosActualizados:', error);
        }
    }
}

const tipopagosController = {
    async getTipopagos(req, res) {
        try {
            const data = await tipopagosService.getRegistros();
            res.status(200).json(data);
        } catch (error) {
            console.error('getTipopagos:', error);
            res.status(500).json({ error: 'Error al obtener tipopagos' });
        }
    },

    async getHistorial(req, res) {
        try {
            const { fi, ff } = req.params;
            const data = await tipopagosService.getHistorial(fi, ff);
            res.status(200).json(data);
        } catch (error) {
            console.error('getHistorial:', error);
            res.status(500).json({ error: 'Error al obtener historial de tipopagos' });
        }
    },

    async crearTipopago(req, res) {
        try {
            const { tipopago } = req.body;

            if (!tipopago) {
                res.status(400).json({ error: 'El campo tipo de pago es necesario' });
            }

            await tipopagosService.crearRegistro({ tipopago });

            await emitirTipopagosActualizados(req);

            res.status(200).json({ message: 'Tipo de pago creado' });
        } catch (error) {
            console.error('crearTipopago:', error);
            res.status(500).json({ error: 'Error al crear tipo de pago' });
        }
    },

    async actualizarTipopago(req, res) {
        try {
            const { id } = req.params;
            const { tipopago } = req.body;

            if (!tipopago) {
                res.status(400).json({ error: 'El campo tipo de pago es necesario' });
            }

            await tipopagosService.actualizarRegistro(id, { tipopago });

            await emitirTipopagosActualizados(req);

            res.status(200).json({ message: 'Tipo de pago creado' });
        } catch (error) {
            console.error('actualizarTipopago:', error);
            res.status(500).json({ error: 'Error al crear tipo de pago' });
        }
    },

    async eliminarTipopago(req, res) {
        try {
            const { id } = req.params;

            await tipopagosService.eliminarRegistro(id);

            await emitirTipopagosActualizados(req);

            res.status(200).json({ message: 'Tipo de pago elminado' });
        } catch (error) {
            console.error('eliminarTipopago:', error);
            res.status(500).json({ error: 'Error al eliminar tipo de pago' });
        }
    },

    async subirTipopago(req, res) {
        try {
            const { id } = req.params;

            await tipopagosService.subirOrden(id);

            await emitirTipopagosActualizados(req);

            res.status(200).json({ message: 'Tipo de pago subioó de orden' });
        } catch (error) {
            console.error('subirTipopago:', error);
            res.status(500).status({ error: 'Error al subir orden tipo de pago' });
        }
    },

    async bajarTipopago(req, res) {
        try {
            const { id } = req.params;

            await tipopagosService.bajarOrden(id);

            await emitirTipopagosActualizados(req);

            res.status(200).json({ message: 'Tipo de pago bajó de orden' });
        } catch (error) {
            console.error('bajarTipopago:', error);
            res.status(500).json({ error: 'Error al bajar de orden tipo de pago' });
        }
    }
};

module.exports = tipopagosController;