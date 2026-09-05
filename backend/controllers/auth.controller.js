import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {pool} from '../config/database.js';
import {ok} from './crud.controller.js';
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api',maxAge:8*60*60*1000};
const dummyHash=await bcrypt.hash('timing-protection-not-a-password',12);
export async function login(req,res) {
  const user=await User.byEmail(req.validated.email);
  const valid=await bcrypt.compare(req.validated.password,user?.password || dummyHash);
  if (!user || !valid || user.role!=='admin') return res.status(401).json({success:false,message:'Email ou mot de passe incorrect.'});
  const token=jwt.sign({version:user.token_version},process.env.JWT_SECRET,{algorithm:'HS256',subject:String(user.id),issuer:'amine-portfolio',audience:'portfolio-admin',expiresIn:'8h'});
  res.cookie('portfolio_session',token,cookieOptions);
  // Tokens deliberately stay in HttpOnly cookies instead of browser storage.
  return ok(res,{id:user.id,name:user.name,email:user.email,role:user.role},'Connexion réussie.');
}
export async function logout(req,res) {
  await pool.execute('UPDATE users SET token_version=token_version+1 WHERE id=?',[req.user.id]);
  res.clearCookie('portfolio_session',{...cookieOptions,maxAge:undefined}); return ok(res,null,'Déconnexion réussie.');
}
export async function me(req,res) { const {token_version,...user}=req.user; const [rows]=await pool.execute("SELECT setting_value FROM settings WHERE setting_key='admin_avatar' LIMIT 1"); return ok(res,{...user,avatar:rows[0]?.setting_value||null}); }
