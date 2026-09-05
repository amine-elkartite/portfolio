import mysql from 'mysql2/promise';
import 'dotenv/config';
const sslMode=(process.env.DB_SSL_MODE||'').toUpperCase();
const ssl=sslMode?{
  rejectUnauthorized:['VERIFY_CA','VERIFY_IDENTITY'].includes(sslMode),
  ...(process.env.DB_SSL_CA?{ca:process.env.DB_SSL_CA.replace(/\\n/g,'\n')}:{})
}:undefined;
export const databaseConfig = {
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'portfolio_app', password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  ...(process.env.DB_SOCKET ? {socketPath: process.env.DB_SOCKET} : {}),
  ...(ssl ? {ssl} : {}),
  waitForConnections: true, connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  charset: 'utf8mb4', timezone: 'Z', decimalNumbers: true,
};
export const pool = mysql.createPool(databaseConfig);
