import {Router} from 'express';
import {controller} from '../controllers/task.controller.js';
import {verifyToken} from '../middleware/auth.js';
import {schemas,idRule,validate} from '../middleware/validation.js';

const router=Router();
router.use(verifyToken); router.get('/',controller.list);
router.post('/',verifyToken,schemas.tasks,validate,controller.create);
router.get('/:id',verifyToken,idRule,validate,controller.get);
router.put('/:id',verifyToken,idRule,schemas.tasks,validate,controller.update);
router.delete('/:id',verifyToken,idRule,validate,controller.remove);
export default router;
