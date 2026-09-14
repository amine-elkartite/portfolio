import 'dotenv/config';
import {readFile} from 'node:fs/promises';
import {pool} from '../config/database.js';

const sql=await readFile(new URL('../../database/migrations/001_mobile_admin.sql',import.meta.url),'utf8');
const conn=await pool.getConnection();
try{
  await conn.query(sql);
  console.log('Migration mobile admin appliquée. Les données existantes sont conservées.');
}finally{
  conn.release();
  await pool.end();
}
