import { pool } from '../config/database.js';
export default {
  async byEmail(email) { const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]); return rows[0]; },
  async byId(id) { const [rows] = await pool.execute('SELECT id, name, email, role, token_version FROM users WHERE id = ?', [id]); return rows[0]; }
};
