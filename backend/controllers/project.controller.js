import Project from '../models/Project.js';
import {ok} from './crud.controller.js';
import {saveImage,removeImage} from '../middleware/upload.js';
import slugify from 'slugify';
import {randomBytes} from 'node:crypto';
const missing=res=>res.status(404).json({success:false,message:'Projet introuvable.'});
export const controller={
 async list(req,res){return ok(res,await Project.all());},
 async get(req,res){const row=await Project.find(req.params.id);return row?ok(res,row):missing(res);},
 async create(req,res){
  const thumbnail=await saveImage(req.file);
  try{
   const data={...req.validated,slug:slugify(req.validated.title,{lower:true,strict:true})+'-'+randomBytes(3).toString('hex'),thumbnail:thumbnail||null,github_url:req.validated.github_url||null,live_url:req.validated.live_url||null,seo_title:req.validated.seo_title||null,seo_description:req.validated.seo_description||null,og_image:req.validated.og_image||null};
   return ok(res,await Project.create(data),'Projet créé.',201);
  }catch(error){await removeImage(thumbnail);throw error;}
 },
 async update(req,res){
  const old=await Project.find(req.params.id);if(!old)return missing(res);
  const thumbnail=await saveImage(req.file);
  let row;
  try{row=await Project.update(req.params.id,{...req.validated,...(thumbnail?{thumbnail}:{}),github_url:req.validated.github_url||null,live_url:req.validated.live_url||null,seo_title:req.validated.seo_title||null,seo_description:req.validated.seo_description||null,og_image:req.validated.og_image||null});}
  catch(error){await removeImage(thumbnail);throw error;}
  if(thumbnail)await removeImage(old.thumbnail);
  return ok(res,row,'Modifications enregistrées.');
 },
 async remove(req,res){const row=await Project.find(req.params.id);if(!row)return missing(res);await Project.remove(row.id);await removeImage(row.thumbnail);return ok(res,null,'Projet supprimé.');}
};
export async function publicList(req,res){return ok(res,(await Project.all()).filter(p=>p.status==='published'));}
export async function publicGet(req,res){const p=await Project.find(req.params.id);return p&&p.status==='published'?ok(res,p):missing(res);}
