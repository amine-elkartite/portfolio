import mysql from 'mysql2/promise';
import 'dotenv/config';
export const databaseConfig = {
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'portfolio_app', password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  ...(process.env.DB_SOCKET ? {socketPath: process.env.DB_SOCKET} : {}),
  waitForConnections: true, connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  charset: 'utf8mb4', timezone: 'Z', decimalNumbers: true,
};
export const pool = mysql.createPool(databaseConfig);
