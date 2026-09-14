import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {body,param} from 'express-validator';
import {verifyToken,requireMobileToken} from '../middleware/auth.js';
import {validate} from '../middleware/validation.js';
import {mobileLogin,mobileRefresh,mobileLogout,sessions,revokeSession,revokeOthers,enableBiometric,disableBiometric} from '../controllers/mobile-auth.controller.js';
import {getNotificationSettings,registerPushToken,removePushToken,saveNotificationSettings} from '../controllers/mobile-notification.controller.js';

const router=Router();
const loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,skipSuccessfulRequests:true,standardHeaders:'draft-8',legacyHeaders:false,message:{success:false,message:'Trop de tentatives. Réessayez dans 15 minutes.'}});
const email=body('email').isEmail().isLength({max:254}).trim();
const password=body('password').isString().isLength({min:1,max:72});
const deviceId=body('deviceId').isString().trim().isLength({min:8,max:128}).matches(/^[A-Za-z0-9._:-]+$/);
const deviceName=body('deviceName').isString().trim().isLength({min:1,max:160});
const platform=body('platform').isIn(['android','ios','unknown']);
const refreshToken=body('refreshToken').isString().isLength({min:32,max:256});

router.post('/login',loginLimiter,email,password,deviceId,deviceName,platform,validate,mobileLogin);
router.post('/refresh',refreshToken,body('deviceId').optional().isString().trim().isLength({min:8,max:128}),validate,mobileRefresh);
router.post('/logout',refreshToken,validate,mobileLogout);

router.use(verifyToken,requireMobileToken);
router.get('/sessions',sessions);
router.delete('/sessions/:id',param('id').isInt({min:1}),validate,revokeSession);
router.post('/sessions/revoke-others',revokeOthers);
router.post('/biometric/enable',enableBiometric);
router.post('/biometric/disable',disableBiometric);
router.get('/notifications',getNotificationSettings);
router.post('/push-token',body('pushToken').isString().trim().isLength({min:16,max:512}),validate,registerPushToken);
router.delete('/push-token',removePushToken);
router.patch('/notification-settings',
  body('notificationsEnabled').optional().isBoolean().toBoolean(),
  body('sound').optional().isBoolean().toBoolean(),
  body('vibration').optional().isBoolean().toBoolean(),
  body('badge').optional().isBoolean().toBoolean(),
  body('showSenderName').optional().isBoolean().toBoolean(),
  validate,saveNotificationSettings);

export default router;
