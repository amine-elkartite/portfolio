import {Router} from 'express';
import {body} from 'express-validator';
import bcrypt from 'bcrypt';
import {pool} from '../config/database.js';
import {verifyToken} from '../middleware/auth.js';
import {validate} from '../middleware/validation.js';
import {ok} from '../controllers/crud.controller.js';
import {upload,saveImage,removeImage} from '../middleware/upload.js';
import {fallbackPublicSettings} from '../data/publicFallbacks.js';
const router=Router();
router.get('/public',async(req,res)=>{
 try{
  const [[rows],[seo]]=await Promise.all([
   pool.query('SELECT setting_key,setting_value FROM settings'),
   pool.query('SELECT site_name,site_url,default_title,default_description,default_og_image FROM seo_settings ORDER BY id LIMIT 1')
  ]);
  return ok(res,{...fallbackPublicSettings,...Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value])),siteName:seo[0]?.site_name||fallbackPublicSettings.siteName,siteUrl:seo[0]?.site_url||fallbackPublicSettings.siteUrl,defaultTitle:seo[0]?.default_title||fallbackPublicSettings.defaultTitle,defaultDescription:seo[0]?.default_description||fallbackPublicSettings.defaultDescription,defaultOgImage:seo[0]?.default_og_image||fallbackPublicSettings.defaultOgImage});
 }catch(error){
  console.warn('[settings public fallback]',error.code||error.name);
  return ok(res,fallbackPublicSettings);
 }
});
router.use(verifyToken);
router.post('/avatar',upload.single('avatar'),async(req,res)=>{
 if(!req.file)return res.status(422).json({success:false,message:'Choisissez une image JPG, PNG ou WebP.'});
 const [rows]=await pool.execute("SELECT setting_value FROM settings WHERE setting_key='admin_avatar' LIMIT 1");
 const avatar=await saveImage(req.file);
 try { await pool.execute("INSERT INTO settings (setting_key,setting_value) VALUES ('admin_avatar',?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",[avatar]); }
 catch(error) { await removeImage(avatar); throw error; }
 if(rows[0]?.setting_value&&rows[0].setting_value!==avatar)await removeImage(rows[0].setting_value);
 ok(res,{avatar},'Photo de profil mise à jour.');
});
router.get('/',async(req,res)=>{const [[rows],[seo],[pages]]=await Promise.all([pool.query('SELECT setting_key,setting_value FROM settings'),pool.query('SELECT * FROM seo_settings ORDER BY id LIMIT 1'),pool.query('SELECT * FROM page_seo ORDER BY id')]);ok(res,{...Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value])),seo:seo[0],pages});});
router.put('/',body('availability').isBoolean().toBoolean(),body('linkedin_url').optional({values:'falsy'}).isURL({protocols:['https'],require_protocol:true}).isLength({max:2048}),body('github_url').optional({values:'falsy'}).isURL({protocols:['https'],require_protocol:true}).isLength({max:2048}),body('instagram_url').optional({values:'falsy'}).isURL({protocols:['https'],require_protocol:true}).isLength({max:2048}),validate,async(req,res)=>{
 const conn=await pool.getConnection();try{await conn.beginTransaction();for(const key of ['availability','linkedin_url','github_url','instagram_url']) await conn.execute('INSERT INTO settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',[key,String(req.validated[key]??'')]);await conn.commit();}catch(e){await conn.rollback();throw e;}finally{conn.release();} ok(res,null,'Paramètres enregistrés.');
});
router.put('/seo',
 body('site_name').isString().trim().isLength({min:1,max:120}),body('site_url').isURL({protocols:['https'],require_protocol:true}).customSanitizer(v=>v.replace(/\/$/,'')),body('default_title').isString().trim().isLength({min:1,max:255}),body('default_description').isString().trim().isLength({min:1,max:320}),body('default_og_image').isString().trim().isLength({min:1,max:255}),body('google_site_verification').optional({values:'falsy'}).isString().trim().isLength({max:255}),body('bing_site_verification').optional({values:'falsy'}).isString().trim().isLength({max:255}),body('google_analytics_id').optional({values:'falsy'}).matches(/^G-[A-Z0-9]+$/i),validate,async(req,res)=>{
  const d=req.validated;await pool.execute('UPDATE seo_settings SET site_name=?,site_url=?,default_title=?,default_description=?,default_og_image=?,google_site_verification=?,bing_site_verification=?,google_analytics_id=? WHERE id=1',[d.site_name,d.site_url,d.default_title,d.default_description,d.default_og_image,d.google_site_verification||null,d.bing_site_verification||null,d.google_analytics_id||null]);ok(res,null,'Référencement général enregistré.');
 });
router.put('/seo/pages',body('pages').isArray({min:6,max:6}).custom(pages=>new Set(pages.map(page=>page.page_key)).size===6),body('pages.*.page_key').isIn(['home','about','services','projects','skills','contact']),body('pages.*.seo_title').isString().trim().isLength({min:1,max:255}),body('pages.*.seo_description').isString().trim().isLength({min:1,max:320}),body('pages.*.canonical_url').optional({values:'falsy'}).isString().trim().isLength({max:255}),body('pages.*.og_image').optional({values:'falsy'}).isString().trim().isLength({max:255}),validate,async(req,res)=>{
 const conn=await pool.getConnection();try{await conn.beginTransaction();for(const page of req.validated.pages)await conn.execute('INSERT INTO page_seo (page_key,seo_title,seo_description,canonical_url,og_image) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),canonical_url=VALUES(canonical_url),og_image=VALUES(og_image)',[page.page_key,page.seo_title,page.seo_description,page.canonical_url||null,page.og_image||null]);await conn.commit();}catch(error){await conn.rollback();throw error;}finally{conn.release();}ok(res,null,'Référencement des pages enregistré.');
});
router.put('/password',body('current_password').isString().isLength({min:1,max:72}),body('new_password').isString().isLength({min:12,max:72}).custom(v=>Buffer.byteLength(v,'utf8')<=72),validate,async(req,res)=>{
 const [rows]=await pool.execute('SELECT password FROM users WHERE id=?',[req.user.id]);
 if(!await bcrypt.compare(req.validated.current_password,rows[0].password))return res.status(422).json({success:false,message:'Mot de passe actuel incorrect.'});
 const hash=await bcrypt.hash(req.validated.new_password,12);
 await pool.execute('UPDATE users SET password=?,token_version=token_version+1 WHERE id=?',[hash,req.user.id]);res.clearCookie('portfolio_session',{path:'/api'});ok(res,null,'Mot de passe changé. Reconnectez-vous.');
});
export default router;
