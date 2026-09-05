import {Router} from 'express';
import {controller} from '../controllers/skill.controller.js';
import {verifyToken} from '../middleware/auth.js';
import {schemas,idRule,validate} from '../middleware/validation.js';

const router=Router();
router.get('/',controller.list);
router.post('/',verifyToken,schemas.skills,validate,controller.create);
router.get('/:id',verifyToken,idRule,validate,controller.get);
router.put('/:id',verifyToken,idRule,schemas.skills,validate,controller.update);
router.delete('/:id',verifyToken,idRule,validate,controller.remove);
export default router;
