import 'dotenv/config';
import mysql from 'mysql2/promise';
import {readFile} from 'node:fs/promises';
import {databaseConfig,pool} from '../config/database.js';
const database=databaseConfig.database;
if(!/^[a-zA-Z0-9_]+$/.test(database))throw new Error('DB_NAME invalide.');
const conn=await mysql.createConnection({...databaseConfig,database:undefined,multipleStatements:true});
try {
 await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
 await conn.changeUser({database});
 let sql=await readFile(new URL('../../database/portfolio.sql',import.meta.url),'utf8');
 sql=sql.replace(/^CREATE DATABASE.*;$/m,'').replace(/^USE portfolio_db;$/m,'');
 await conn.query(sql);console.log(`Base ${database} initialisée. Les données existantes sont conservées.`);
} finally {await conn.end();await pool.end();}
