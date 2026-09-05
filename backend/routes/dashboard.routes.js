import {Router} from 'express';
import {verifyToken} from '../middleware/auth.js';
import {stats} from '../controllers/dashboard.controller.js';
const router=Router();router.get('/stats',verifyToken,stats);export default router;
