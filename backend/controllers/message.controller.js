import Message from '../models/Message.js';
import {pool} from '../config/database.js';
import {sendNewMessageNotification} from '../services/pushNotification.service.js';
import {crud,ok} from './crud.controller.js';
export const controller=crud(Message);

export async function submit(req,res) {
  const message=await Message.create({...req.validated,status:'unread'});
  try{await sendNewMessageNotification(message);}catch(error){console.warn('[new message push skipped]',error.code||error.name||error.message);}
  return ok(res,null,'Votre message a été envoyé avec succès.',201);
}

export async function status(req,res) {
  const row=await Message.update(req.params.id,req.validated);
  if (!row) return res.status(404).json({success:false,message:'Message introuvable.'});
  return ok(res,row);
}

export async function getOne(req,res){
  const row=await Message.find(req.params.id);
  if(!row)return res.status(404).json({success:false,message:'Message introuvable.'});
  return ok(res,row);
}

export async function unreadCount(req,res){
  const [rows]=await pool.query("SELECT COUNT(*) AS count FROM messages WHERE status='unread'");
  return ok(res,{count:Number(rows[0]?.count||0)});
}
