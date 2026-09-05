import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {login,logout,me} from '../controllers/auth.controller.js';
import {verifyToken} from '../middleware/auth.js';
import {loginRules,validate} from '../middleware/validation.js';
const router=Router();
router.post('/login',rateLimit({windowMs:15*60*1000,limit:10,skipSuccessfulRequests:true,standardHeaders:'draft-8',legacyHeaders:false,message:{success:false,message:'Trop de tentatives. Réessayez dans 15 minutes.'}}),loginRules,validate,login);
router.get('/me',verifyToken,me); router.post('/logout',verifyToken,logout);
export default router;
