import { body, param, validationResult, matchedData } from 'express-validator';
export const validate = (req,res,next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({success:false,message:'Vérifiez les champs du formulaire.',errors:errors.array().map(e => ({field:e.path,message:e.msg}))});
  req.validated = matchedData(req, {locations:['body']}); next();
};
export const idRule = param('id').isInt({min:1}).withMessage('Identifiant invalide.');
const text = (name, max, optional=false) => {
  const rule = body(name); if (optional) rule.optional({values:'null'});
  return rule.isString().bail().trim().isLength({min:optional ? 0 : 1,max}).withMessage(`Champ ${name} invalide.`).customSanitizer(v => v.replace(/\u0000/g,''));
};
const choice = (name, values) => body(name).isIn(values).withMessage(`Valeur ${name} invalide.`);
const integer = (name,min,max) => body(name).isInt({min,max}).toInt();
const url = name => body(name).optional({values:'falsy'}).isURL({protocols:['http','https'],require_protocol:true}).isLength({max:2048});
const imageUrl = name => body(name).optional({values:'falsy'}).custom(value => /^\/(?!\/)[a-zA-Z0-9/_.-]+$/.test(value) || /^https?:\/\//i.test(value)).isLength({max:255}).withMessage(`Valeur ${name} invalide.`);
const date = name => body(name).optional({values:'falsy'}).isISO8601().customSanitizer(v => v.slice(0,10));
export const schemas = {
  projects:[text('title',150),text('description',500),text('long_description',10000,true),choice('category',['Sites Web','E-commerce','Applications Web','Applications Mobiles','APIs','Autres']), body('technologies').customSanitizer(v => typeof v === 'string' ? v.split(',').map(t=>t.trim()).filter(Boolean) : v).isArray({max:20}).bail().custom(v => v.every(t => typeof t === 'string' && t.length > 0 && t.length <= 40)),url('github_url'),url('live_url'),choice('status',['draft','published','in_progress','completed']),body('featured').isBoolean().toBoolean(),text('seo_title',255,true),text('seo_description',320,true),imageUrl('og_image')],
  services:[text('title',150),text('description',2000),text('icon',60),integer('order_position',0,10000),body('active').isBoolean().toBoolean()],
  skills:[text('name',80),choice('category',['Front-end','Back-end','Outils & DevOps','Design & Autres']),integer('percentage',0,100),text('icon',60,true),integer('order_position',0,10000)],
  messages:[text('name',100),body('email').isEmail().isLength({max:254}).trim(),text('subject',200),text('message',5000)],
  clients:[text('name',120),text('company',150,true),body('email').isEmail().isLength({max:254}).trim(),text('phone',30,true),text('notes',5000,true)],
  tasks:[text('title',200),text('description',5000,true),choice('status',['todo','in_progress','done']),choice('priority',['low','medium','high']),date('due_date')],
  quotes:[text('number',60,true),body('client_id').optional({values:'falsy'}).isInt({min:1}).toInt(),text('title',200),body('amount').isFloat({min:0,max:999999999}).toFloat(),choice('status',['draft','sent','accepted','rejected']),date('due_date'),text('notes',5000,true)],
  invoices:[text('number',60,true),body('client_id').optional({values:'falsy'}).isInt({min:1}).toInt(),text('title',200),body('amount').isFloat({min:0,max:999999999}).toFloat(),choice('status',['draft','sent','paid','overdue']),date('due_date'),date('paid_at'),text('notes',5000,true)],
};
export const loginRules=[body('email').isEmail().isLength({max:254}).trim(),body('password').isString().isLength({min:1,max:72})];
