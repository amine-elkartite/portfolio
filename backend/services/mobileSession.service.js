import crypto from 'node:crypto';
import {pool} from '../config/database.js';

export const MOBILE_ACCESS_TTL='15m';
export const MOBILE_SESSION_DAYS=30;

export function createOpaqueCredential(){
  return crypto.randomBytes(48).toString('base64url');
}

export function hashCredential(value){
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function mobileSessionExpiry(){
  const date=new Date();
  date.setDate(date.getDate()+MOBILE_SESSION_DAYS);
  return date;
}

export async function createOrReplaceMobileSession({userId,deviceId,deviceName,platform,credentialHash,expiresAt}){
  await pool.execute(`INSERT INTO mobile_sessions (user_id,device_id,device_name,platform,refresh_token_hash,biometric_enabled,expires_at,revoked_at,last_used_at)
    VALUES (?,?,?,?,?,FALSE,?,NULL,NOW())
    ON DUPLICATE KEY UPDATE device_name=VALUES(device_name),platform=VALUES(platform),refresh_token_hash=VALUES(refresh_token_hash),biometric_enabled=FALSE,expires_at=VALUES(expires_at),revoked_at=NULL,last_used_at=NOW()`,
    [userId,deviceId,deviceName,platform,credentialHash,expiresAt]);
  const [rows]=await pool.execute('SELECT * FROM mobile_sessions WHERE user_id=? AND device_id=? LIMIT 1',[userId,deviceId]);
  return rows[0];
}

export async function findSessionByCredential(value){
  const hash=hashCredential(value);
  const [rows]=await pool.execute(`SELECT ms.*,u.id AS account_id,u.name,u.email,u.role,u.token_version FROM mobile_sessions ms JOIN users u ON u.id=ms.user_id
    WHERE ms.refresh_token_hash=? AND ms.revoked_at IS NULL AND ms.expires_at>NOW() LIMIT 1`,[hash]);
  return rows[0];
}

export async function rotateMobileSession(id,previousHash,newHash,expiresAt){
  const [result]=await pool.execute('UPDATE mobile_sessions SET refresh_token_hash=?,expires_at=?,last_used_at=NOW() WHERE id=? AND refresh_token_hash=? AND revoked_at IS NULL AND expires_at>NOW()',[newHash,expiresAt,id,previousHash]);
  return result.affectedRows===1;
}

export async function revokeSessionByCredential(value){
  const [result]=await pool.execute('UPDATE mobile_sessions SET revoked_at=NOW(),push_token=NULL WHERE refresh_token_hash=?',[hashCredential(value)]);
  return result.affectedRows>0;
}

export async function revokeOtherSessions(userId,keepId){
  const [result]=await pool.execute('UPDATE mobile_sessions SET revoked_at=NOW(),push_token=NULL WHERE user_id=? AND id<>? AND revoked_at IS NULL',[userId,keepId]);
  return result.affectedRows;
}
