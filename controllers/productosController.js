const productosService = require('../services/productosService');
const { format } = require('date-fns/format');

const emitirProductosActualizados = async (req) => {
    if (req.io) {
        try {
            const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const data = await productosService.getRegistros();
            req.io.to('productos-room').emit('productos-actualizados', data);
            console.log(fecha, 'productos-room: datos actualizados');
        } catch (error) {
            console.error('emitirProductosActualizados:', error);
        }
    }
}

const productosController = {
    async obtenerProductos(req, res) {
        try {
            const data = await productosService.getRegistros();
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener productos' });
        }
    },

    async getHistorial(req, res) {
        try {
            const { fi, ff } = req.params;
            const data = await productosService.getHistorial(fi, ff);
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener historial' });
        }
    },

    async crearProducto(req, res) {
        try {
            const { producto, costo } = req.body;
            if (!producto) {
                res.status(400).json({ error: 'El nombre es requerido' });
            }

            await productosService.crearRegistro({ producto, costo });

            await emitirProductosActualizados(req);

            res.status(200).json({ message: 'Producto creado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear producto' });
        }
    },

    async actualizarProducto(req, res) {
        try {
            const { id } = req.params;
            const { producto, costo } = req.body;
            if (!producto) {
                res.status(400).json({ error: 'El nombre es requerido' });
            }

            await productosService.actualizarRegistro(id, { producto, costo });

            await emitirProductosActualizados(req);

            res.status(200).json({ message: 'Producto actualizado' })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar producto' });
        }
    },

    async eliminarProducto(req, res) {
        try {
            const { id } = req.params;

            await productosService.eliminarRegistro(id);

            await emitirProductosActualizados(req),

                res.status(200).json({ message: 'Producto eliminado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar producto' });
        }
    },

    async subirProducto(req, res) {
        try {
            const { id } = req.params;

            await productosService.subirOrden(id);

            await emitirProductosActualizados(req);

            res.status(200).json({ message: 'Producto subió de orden' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al subir de orden de producto' });
        }
    },

    async bajarProducto(req, res) {
        try {
            const { id } = req.params;

            await productosService.bajarOrden(id);

            await emitirProductosActualizados(req);

            res.status(200).json({ message: 'Producto bajó de orden' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al bajar orden de producto' });
        }
    }
};

module.exports = productosController;