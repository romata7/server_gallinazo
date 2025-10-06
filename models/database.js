const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helpers para queries
const query = async (sql, params = [], connection = pool) => {
  const [result] = await connection.execute(sql, params);
  return result;
};

const findOne = async (sql, params = [], connection = pool) => {
  const result = await query(sql, params, connection);
  return result[0] || null;
};

// Transacción helper
const executeTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, query, findOne, executeTransaction };