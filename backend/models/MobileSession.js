import {pool} from '../config/database.js';

const publicColumns='id,user_id,device_id,device_name,platform,biometric_enabled,notifications_enabled,notification_sound,notification_vibration,notification_badge,show_sender_name,created_at,updated_at,last_used_at,expires_at,revoked_at';

export async function findMobileSession(id,userId){
  const [rows]=await pool.execute(`SELECT ${publicColumns},push_token IS NOT NULL AS push_registered FROM mobile_sessions WHERE id=? AND user_id=? LIMIT 1`,[id,userId]);
  return rows[0];
}

export async function listMobileSessions(userId){
  const [rows]=await pool.execute(`SELECT ${publicColumns},push_token IS NOT NULL AS push_registered FROM mobile_sessions WHERE user_id=? ORDER BY (revoked_at IS NULL AND expires_at>NOW()) DESC,last_used_at DESC,created_at DESC`,[userId]);
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

export async function setPushToken(id,userId,pushToken){
  const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();
    if(pushToken)await conn.execute('UPDATE mobile_sessions SET push_token=NULL WHERE push_token=? AND NOT (id=? AND user_id=?)',[pushToken,id,userId]);
    const [result]=await conn.execute('UPDATE mobile_sessions SET push_token=? WHERE id=? AND user_id=? AND revoked_at IS NULL',[pushToken||null,id,userId]);
    await conn.commit();
    return result.affectedRows>0;
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
}

export async function updateNotificationSettings(id,userId,settings){
  const allowed=['notifications_enabled','notification_sound','notification_vibration','notification_badge','show_sender_name'];
  const entries=allowed.filter(key=>settings[key]!==undefined).map(key=>[key,settings[key]?1:0]);
  if(!entries.length)return findMobileSession(id,userId);
  await pool.execute(`UPDATE mobile_sessions SET ${entries.map(([key])=>`${key}=?`).join(',')} WHERE id=? AND user_id=? AND revoked_at IS NULL`,[...entries.map(([,value])=>value),id,userId]);
  return findMobileSession(id,userId);
}

export async function enabledPushTargets(){
  const [rows]=await pool.query(`SELECT id,user_id,push_token,notification_sound,notification_vibration,notification_badge,show_sender_name FROM mobile_sessions WHERE push_token IS NOT NULL AND notifications_enabled=TRUE AND revoked_at IS NULL AND expires_at>NOW()`);
  return rows;
}

export async function disablePushToken(pushToken){
  await pool.execute('UPDATE mobile_sessions SET push_token=NULL WHERE push_token=?',[pushToken]);
}
