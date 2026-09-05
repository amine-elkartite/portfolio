import {Router} from 'express';
import {controller} from '../controllers/quote.controller.js';
import {verifyToken} from '../middleware/auth.js';
import {schemas,idRule,validate} from '../middleware/validation.js';

const router=Router();
router.use(verifyToken); router.get('/',controller.list);
router.get('/next-number',controller.next);
router.post('/',verifyToken,schemas.quotes,validate,controller.create);
router.get('/:id/pdf',verifyToken,idRule,validate,controller.pdf);
router.get('/:id',verifyToken,idRule,validate,controller.get);
router.put('/:id',verifyToken,idRule,schemas.quotes,validate,controller.update);
router.delete('/:id',verifyToken,idRule,validate,controller.remove);
export default router;
