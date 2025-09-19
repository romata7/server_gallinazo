const express = require('express')
const router = express.Router()
const moment = require('moment')
const database = require('../models/database')

//agregar impresión a la base de datos
router.post('/print', async (req, res) => {
    const comanda = req.body.ticket
    if (comanda.fecha) {
        comanda.fecha = moment(comanda.fecha).format('YYYY-MM-DD HH:mm:ss');
    };
    const itemsJSON = JSON.stringify(comanda.items)

    //comenzar la transacción
    const connection = await database.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(`CALL AddPrint(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            comanda.destino,
            comanda.id_comanda,
            comanda.fecha,
            comanda.operacion,
            comanda.origen,
            comanda.reg_dato,
            comanda.mesa,
            comanda.cliente,
            comanda.mozo,
            comanda.tipo_pago,
            comanda.total,
            comanda.notas_comanda,
            itemsJSON,
        ]);
        //Confirmar Transacción
        await connection.commit();

        res.send('ok')
    } catch (error) {
        // S i  hay error, deshacer la transacción
        await connection.rollback();
        console.error('Error al insertar Prints:', error);
        res.status(500).send('Error al procesar la solicitud');
    } finally {
        // Cerrar connection
        connection.release();
    }
});

router.get('/prints/:fi?/:ff?', async (req, res) => {
    let { fi, ff } = req.params;

    // Si no se proporcionan las fechas, establecer el rango por defecto
    if (!fi) {
        fi = moment().startOf('day').toISOString(); // Hoy a las 00:00 horas
    }
    if (!ff) {
        ff = moment().endOf('day').toISOString(); // Hoy a las 23:59:59
    }

    const connection = await database.getConnection();
    try {
        // Llamar al procedimiento almacenado
        const [results] = await connection.query(`CALL GetPrintsByDateRange(?, ?)`, [fi, ff]);

        res.json(results[0]); // Enviar los resultados como respuesta
    } catch (error) {
        console.error('Error al obtener los prints:', error);
        res.status(500).send('Error al procesar la solicitud');
    } finally {
        connection.release();
    }
});

module.exports = router