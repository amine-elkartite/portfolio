import {pool} from '../config/database.js';

export async function findMobileSession(id,userId){
  const [rows]=await pool.execute('SELECT id,user_id,device_id,device_name,platform,biometric_enabled,notifications_enabled,created_at,updated_at,last_used_at,expires_at,revoked_at FROM mobile_sessions WHERE id=? AND user_id=? LIMIT 1',[id,userId]);
  return rows[0];
}

export async function listMobileSessions(userId){
  const [rows]=await pool.execute('SELECT id,user_id,device_id,device_name,platform,biometric_enabled,notifications_enabled,created_at,updated_at,last_used_at,expires_at,revoked_at FROM mobile_sessions WHERE user_id=? ORDER BY created_at DESC',[userId]);
  return rows;
}

export async function setBiometricEnabled(id,userId,enabled){
  const [result]=await pool.execute('UPDATE mobile_sessions SET biometric_enabled=? WHERE id=? AND user_id=? AND revoked_at IS NULL',[enabled?1:0,id,userId]);
  return result.affectedRows>0;
}

export async function revokeMobileSession(id,userId){
  const [result]=await pool.execute('UPDATE mobile_sessions SET revoked_at=NOW(),push_token=NULL WHERE id=? AND user_id=?',[id,userId]);
  return result.affectedRows>0;
}
