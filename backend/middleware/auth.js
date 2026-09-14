import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function getCookie(req, name) {
  const entry = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  try { return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null; } catch { return null; }
}

const databaseErrorCodes=new Set(['ECONNREFUSED','ETIMEDOUT','ENOTFOUND','EAI_AGAIN','ER_ACCESS_DENIED_ERROR','ER_BAD_DB_ERROR','ER_NO_SUCH_TABLE','PROTOCOL_CONNECTION_LOST','ER_CON_COUNT_ERROR']);
const allowedAudiences=['portfolio-admin','portfolio-mobile-admin'];

export async function verifyToken(req, res, next) {
  const bearer=req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  const token = bearer || getCookie(req, 'portfolio_session');
  if (!token) return res.status(401).json({success:false, message:'Connexion requise.'});
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {algorithms:['HS256'], issuer:'amine-portfolio', audience:allowedAudiences});
    const user = await User.byId(payload.sub);
    if (!user || user.role !== 'admin' || user.token_version !== payload.version) return res.status(401).json({success:false,message:'Session expirée.'});
    req.user = user;
    req.auth={
      audience:payload.aud,
      sessionId:payload.sid ? Number(payload.sid) : null,
      tokenType:bearer ? 'bearer' : 'cookie'
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({success:false,message:'Session expirée.'});
    if(databaseErrorCodes.has(error.code)) return res.status(503).json({success:false,message:'Connexion à la base de données indisponible.',code:error.code});
    next(error);
  }
}

export function requireMobileToken(req,res,next){
  if(req.auth?.audience!=='portfolio-mobile-admin'||!req.auth?.sessionId)return res.status(403).json({success:false,message:'Session mobile requise.'});
  next();
}

export function sameOrigin(req,res,next) {
  if (['GET','HEAD','OPTIONS'].includes(req.method) || req.headers.authorization?.startsWith('Bearer ')) return next();
  const origin = req.get('origin');
  const allowed = (process.env.FRONTEND_URL || 'http://localhost:5000').split(',').map(s => s.trim());
  if ((origin && !allowed.includes(origin)) || req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({success:false,message:'Origine non autorisée.'});
  if (getCookie(req,'portfolio_session') && req.get('x-requested-with') !== 'Portfolio') return res.status(403).json({success:false,message:'Requête non autorisée.'});
  next();
}
