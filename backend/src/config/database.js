import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database configuration
 */
const dbConfig = {
  host: process.env.DB_HOST || 'sv63.ifastnet12.org',
  user: process.env.DB_USER || 'masakali_kiran',
  password: process.env.DB_PASSWORD || 'K143iran',
  database: process.env.DB_NAME || 'masakali_code_snippets',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

/**
 * Create connection pool
 */
export const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Execute query with error handling
 */
export async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
