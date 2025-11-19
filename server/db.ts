import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../shared/schema';

// Create the connection pool
const poolConnection = mysql.createPool({
  host: "sv63.ifastnet12.org",
  user: "masakali_kiran",
  password: "K143iran",
  database: "masakali_code_snippets",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });
export { poolConnection };
