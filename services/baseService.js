const db = require('../models/database');
const { format } = require('date-fns/format');

class BaseService {
    constructor(mainTable, historyTable, uniqueField = 'name') {
        this.mainTable = mainTable;
        this.historyTable = historyTable;
        this.uniqueField = uniqueField;
    }

    async getMaxOrden(conn = db.pool) {
        const result = await db.query(
            `SELECT MAX(orden) AS max_orden FROM ${this.mainTable}`,
            [],
            conn
        );
        return result[0].max_orden || 0;
    }

    async getProximoMenor(orden, conn = db.pool) {
        const result = await db.query(
            `SELECT * FROM ${this.mainTable} WHERE orden < ? ORDER BY orden DESC LIMIT 1`,
            [orden],
            conn
        );
        return result.length > 0 ? result[0] : null;
    }

    async getProximoMayor(orden, conn = db.pool) {
        const result = await db.query(
            `SELECT * FROM ${this.mainTable} WHERE orden > ? ORDER BY orden ASC LIMIT 1`,
            [orden],
            conn
        );
        return result.length > 0 ? result[0] : null;
    }

    async getRegistros(
        fechaInicio = new Date(),
        fechaFin = new Date(),
        conn = db.pool
    ) {
        const [registros, historial] = await Promise.all([
            db.query(`SELECT * FROM ${this.mainTable} ORDER BY orden`, [], conn),
            db.query(
                `SELECT * FROM ${this.historyTable} WHERE fecha BETWEEN ? AND ? ORDER BY id DESC`,
                [`${format(fechaInicio, 'yyyy-MM-dd')} 00:00:00`, `${format(fechaFin, 'yyyy-MM-dd')} 23:59:59`],
                conn
            ),
        ]);

        return {
            [this.mainTable]: registros,
            [`${this.mainTable}_historial`]: historial
        };
    }

    async getHistorial(
        fechaInicio = format(new Date(), 'yyyy-MM-dd'),
        fechaFin = format(new Date(), 'yyyy-MM-dd'),
        conn = db.pool,
    ) {
        let fi = `${fechaInicio} 00:00:00`;
        let ff = `${fechaFin} 23:59:59`;

        const historial = await db.query(
            `SELECT * FROM ${this.historyTable} WHERE fecha BETWEEN ? AND ? ORDER BY id DESC`,
            [fi, ff],
            conn
        );

        return historial;
    }
    
    async registrarEnHistorial(operacion, idReferencia, datos, conn) {
        const fecha = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        // Extraer campos y valores (excluyendo el ID principal si existe)
        const { id, ...datosParaHistorial } = datos;
        const campos = Object.keys(datosParaHistorial).join(', ');
        const placeholders = Object.keys(datosParaHistorial).map(() => '?').join(', ');
        const valores = Object.values(datosParaHistorial);

        await db.query(
            `INSERT INTO ${this.historyTable} 
             (operacion, id_${this.mainTable.slice(0, -1)}, ${campos}, fecha) 
             VALUES (?, ?, ${placeholders}, ?)`,
            [operacion, idReferencia, ...valores, fecha],
            conn
        );
    }

    async crearRegistro(datos) {
        const operacion = 'AGREGADO';
        return db.executeTransaction(async (conn) => {
            const maxOrden = await this.getMaxOrden(conn);
            const nuevoMaxOrden = maxOrden + 1;

            // 1. Construir datos para la tabla principal
            const campos = Object.keys(datos).join(', ');
            const placeholders = Object.keys(datos).map(() => '?').join(', ');
            const valores = [...Object.values(datos), nuevoMaxOrden];

            // 2. Insertar en tabla principal
            const result = await db.query(
                `INSERT INTO ${this.mainTable} (${campos}, orden) VALUES(${placeholders}, ?)`,
                valores,
                conn
            );

            const nuevoId = result.insertId;

            // 3. Insertar en historial usando el método unificado
            await this.registrarEnHistorial(
                operacion,
                nuevoId,
                { ...datos, orden: nuevoMaxOrden },
                conn
            );
        });
    }

    async actualizarRegistro(id, datos) {
        const operacion = 'MODIFICADO';
        return db.executeTransaction(async (conn) => {
            // 1. Verificar que el registro existe
            const registros = await db.query(
                `SELECT * FROM ${this.mainTable} WHERE id = ?`,
                [id],
                conn
            );
            if (registros.length === 0) {
                throw new Error(`No se encontró el registro con ID: ${id}`);
            }

            const registro = registros[0];

            // 2. Construir la consulta UPDATE dinámicamente
            const campos = Object.keys(datos).map(campo => `${campo} = ?`).join(', ');
            const valores = [...Object.values(datos), id];

            // 3. Actualizar en tabla principal
            await db.query(
                `UPDATE ${this.mainTable} SET ${campos} WHERE id = ?`,
                valores,
                conn
            );

            // 4. Insertar en historial usando el método unificado
            await this.registrarEnHistorial(
                operacion,
                id,
                datos,
                conn
            );
        });
    }

    async eliminarRegistro(id) {
        const operacion = 'ELIMINADO';
        return db.executeTransaction(async (conn) => {
            // 1. Obtener el registro antes de eliminarlo
            const registros = await db.query(
                `SELECT * FROM ${this.mainTable} WHERE id = ?`,
                [id],
                conn
            );
            const registro = registros[0];
            if (registros.length === 0) {
                throw new Error(`No se encontró el registro con ID: ${id}`);
            }

            // 2. Eliminar de la tabla principal
            await db.query(
                `DELETE FROM ${this.mainTable} WHERE id = ?`,
                [id],
                conn
            );

            // 3. Insertar en historial usando el método unificado
            await this.registrarEnHistorial(
                operacion,
                id,
                registro,
                conn
            );
        });
    }

    async subirOrden(id) {
        return db.executeTransaction(async (conn) => {
            // 1. Verificar que el registro existe
            const registros = await db.query(
                `SELECT * FROM ${this.mainTable} WHERE id = ?`,
                [id],
                conn
            );

            if (registros.length === 0) {
                throw new Error(`No se encontró el registro con ID: ${id}`);
            }

            const registro = registros[0];
            const { orden } = registro;

            // 2. Buscar elemento anterior
            const menor = await this.getProximoMenor(orden, conn);

            if (!menor) {
                throw new Error('No hay elemento anterior para subir');
            }

            // 3. Intercambiar órdenes
            await db.query(
                `UPDATE ${this.mainTable} SET orden = ? WHERE id = ?`,
                [menor.orden, id],
                conn
            );

            await db.query(
                `UPDATE ${this.mainTable} SET orden = ? WHERE id = ?`,
                [orden, menor.id],
                conn
            );

            // 4. Registrar en historial usando el método unificado
            await this.registrarEnHistorial('SUBE', id, registro, conn);
            await this.registrarEnHistorial('BAJA', menor.id, menor, conn);
        });
    }

    async bajarOrden(id) {
        return db.executeTransaction(async (conn) => {
            // 1. Verificar que el registro existe
            const registros = await db.query(
                `SELECT * FROM ${this.mainTable} WHERE id = ?`,
                [id],
                conn
            );

            if (registros.length === 0) {
                throw new Error(`No se encontró el registro con ID: ${id}`);
            }

            const registro = registros[0];
            const { orden } = registro;

            // 2. Buscar elemento siguiente
            const mayor = await this.getProximoMayor(orden, conn);

            if (!mayor) {
                throw new Error('No hay elemento siguiente para bajar');
            }

            // 3. Intercambiar órdenes
            await db.query(
                `UPDATE ${this.mainTable} SET orden = ? WHERE id = ?`,
                [mayor.orden, id],
                conn
            );

            await db.query(
                `UPDATE ${this.mainTable} SET orden = ? WHERE id = ?`,
                [orden, mayor.id],
                conn
            );

            // 4. Registrar en historial usando el método unificado
            await this.registrarEnHistorial('BAJA', id, registro, conn);
            await this.registrarEnHistorial('SUBE', mayor.id, mayor, conn);
        });
    }
}

module.exports = BaseService;