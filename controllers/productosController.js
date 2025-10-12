const productosServices = require('../services/productosService');

const emitirActualizacionesProductos = async (req) => {
    if (req.io) {
        try {
            const data = await productosServices.getRegistros();
            req.io.to('productos-room').emit('productos-actualizados', data);
            console.log('productos-room: datos actualizados');
        } catch (error) {
            console.error('emitirActualizacionesProductos:', error);
        }
    }
}

const productosController = {
    async obtenerProductos(req, res) {
        try {
            const data = await productosServices.getRegistros();
            res.status(200).json(data);
        } catch (error) {
            console.error('obtenerProductos:', error);
            res.status(500).json({ error: 'Error obtener productos del servidor' });
        }
    },

    async crearProducto(req, res) {
        try {
            const { producto, costo } = req.body;

            if (!producto) {
                res.status(400).json({ error: 'El producto es requerido' });
            }

            await productosServices.crearRegistro({ producto, costo });

            await emitirActualizacionesProductos(req);
            const data = await productosServices.getRegistros()

            res.status(200).json(data);
        } catch (error) {
            console.error('crearProducto:', error);
            res.status(500).json({ error: 'Error al crear producto en el servidor' });
        }
    },

    async actualizarProducto(req, res) {
        try {
            const { id } = req.params;
            const { producto, costo, orden } = req.body;

            if (!producto) {
                return res.status(400).json({ error: 'El producto es requerido' });
            }

            await productosServices.actualizarProducto(id, { producto, costo, orden });

            await emitirActualizacionesProductos(req);
            const data = await productosServices.getRegistros();

            res.status(200).json(data);
        } catch (error) {
            console.error('actualizarProducto:', error);
            res.status(500).json({ error: 'Error al actualizar producto' });
        }
    },

    async eliminarProducto(req, res) {
        try {
            const { id } = req.params;

            await productosServices.eliminarRegistro(id);

            await emitirActualizacionesProductos(req);
            const data = await productosServices.getRegistros();

            res.status(200).json(data);
        } catch (error) {
            console.error('eliminarPorducto:', error);
            res.status(500).json({ error: 'Error al eliminar producto' });
        }
    }
}

module.exports = productosController;