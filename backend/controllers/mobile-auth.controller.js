import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {findMobileSession,listMobileSessions,setBiometricEnabled,revokeMobileSession} from '../models/MobileSession.js';
import {MOBILE_ACCESS_TTL,createOpaqueCredential,hashCredential,mobileSessionExpiry,createOrReplaceMobileSession,findSessionByCredential,rotateMobileSession,revokeSessionByCredential,revokeOtherSessions} from '../services/mobileSession.service.js';
import {ok} from './crud.controller.js';

const dummyHash=await bcrypt.hash('mobile-timing-protection-not-a-password',12);

function accountId(user){return user.account_id??user.user_id??user.id;}
function publicUser(user){return {id:accountId(user),name:user.name,email:user.email,role:user.role};}
function publicSession(session){
  if(!session)return null;
  return {id:session.id,deviceId:session.device_id,deviceName:session.device_name,platform:session.platform,biometricEnabled:Boolean(session.biometric_enabled),notificationsEnabled:Boolean(session.notifications_enabled),createdAt:session.created_at,lastUsedAt:session.last_used_at,expiresAt:session.expires_at,revokedAt:session.revoked_at};
}
function signAccessToken(user,sessionId){
  return jwt.sign({version:user.token_version,sid:String(sessionId)},process.env.JWT_SECRET,{algorithm:'HS256',subject:String(accountId(user)),issuer:'amine-portfolio',audience:'portfolio-mobile-admin',expiresIn:MOBILE_ACCESS_TTL});
}

export async function mobileLogin(req,res){
  const user=await User.byEmail(req.validated.email);
  const valid=await bcrypt.compare(req.validated.password,user?.password||dummyHash);
  if(!user||!valid||user.role!=='admin')return res.status(401).json({success:false,message:'Email ou mot de passe incorrect.'});
  const refreshToken=createOpaqueCredential();
  const session=await createOrReplaceMobileSession({userId:user.id,deviceId:req.validated.deviceId,deviceName:req.validated.deviceName,platform:req.validated.platform,credentialHash:hashCredential(refreshToken),expiresAt:mobileSessionExpiry()});
  const accessToken=signAccessToken(user,session.id);
  return ok(res,{accessToken,refreshToken,expiresIn:900,user:publicUser(user),session:publicSession(session)},'Connexion mobile réussie.');
}

export async function mobileRefresh(req,res){
  const session=await findSessionByCredential(req.validated.refreshToken);
  if(!session||session.role!=='admin')return res.status(401).json({success:false,message:'Session mobile expirée.'});
  if(req.validated.deviceId&&session.device_id!==req.validated.deviceId)return res.status(401).json({success:false,message:'Session mobile invalide.'});
  const previousHash=hashCredential(req.validated.refreshToken);
  const nextRefreshToken=createOpaqueCredential();
  const rotated=await rotateMobileSession(session.id,previousHash,hashCredential(nextRefreshToken),mobileSessionExpiry());
  if(!rotated)return res.status(401).json({success:false,message:'Session mobile déjà renouvelée. Reconnectez-vous.'});
  const accessToken=signAccessToken(session,session.id);
  return ok(res,{accessToken,refreshToken:nextRefreshToken,expiresIn:900,user:publicUser(session),session:publicSession(await findMobileSession(session.id,session.user_id))});
}

export async function mobileLogout(req,res){
  await revokeSessionByCredential(req.validated.refreshToken);
  return ok(res,null,'Déconnexion mobile réussie.');
}

export async function sessions(req,res){
  const rows=await listMobileSessions(req.user.id);
  return ok(res,rows.map(row=>({...publicSession(row),current:req.auth?.sessionId===row.id})));
}

export async function revokeSession(req,res){
  const id=Number(req.params.id);
  if(id===req.auth?.sessionId)return res.status(409).json({success:false,message:'Utilisez la déconnexion pour révoquer cet appareil.'});
  const removed=await revokeMobileSession(id,req.user.id);
  if(!removed)return res.status(404).json({success:false,message:'Session mobile introuvable.'});
  return ok(res,null,'Appareil déconnecté.');
}

export async function revokeOthers(req,res){
  const count=await revokeOtherSessions(req.user.id,req.auth.sessionId);
  return ok(res,{revoked:count},'Les autres appareils ont été déconnectés.');
}

export async function enableBiometric(req,res){
  const updated=await setBiometricEnabled(req.auth.sessionId,req.user.id,true);
  if(!updated)return res.status(404).json({success:false,message:'Session mobile introuvable.'});
  return ok(res,{enabled:true},'Connexion biométrique activée.');
}

export async function disableBiometric(req,res){
  const updated=await setBiometricEnabled(req.auth.sessionId,req.user.id,false);
  if(!updated)return res.status(404).json({success:false,message:'Session mobile introuvable.'});
  return ok(res,{enabled:false},'Connexion biométrique désactivée.');
}
