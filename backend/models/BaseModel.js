import { pool } from '../config/database.js';
// Identifiers only originate from the hard-coded model definitions, never requests.
export function createModel(table, fields, order = 'id DESC') {
  const clean = data => Object.fromEntries(fields.filter(k => data[k] !== undefined).map(k => [k, typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]]));
  return {
    async all() { const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${order}`); return rows; },
    async find(id) { const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]); return rows[0]; },
    async create(data) { const values = clean(data); const keys = Object.keys(values); const [result] = await pool.execute(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, Object.values(values)); return this.find(result.insertId); },
    async update(id, data) { const values = clean(data); const keys = Object.keys(values); if (!keys.length) return this.find(id); await pool.execute(`UPDATE ${table} SET ${keys.map(k => `${k} = ?`).join(',')} WHERE id = ?`, [...Object.values(values), id]); return this.find(id); },
    async remove(id) { const [result] = await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id]); return result.affectedRows > 0; }
  };
}
