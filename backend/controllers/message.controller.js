import Message from '../models/Message.js';
import {crud,ok} from './crud.controller.js';
export const controller=crud(Message);
export async function submit(req,res) { await Message.create({...req.validated,status:'unread'}); return ok(res,null,'Votre message a été envoyé avec succès.',201); }
export async function status(req,res) { const row=await Message.update(req.params.id,req.validated); if (!row) return res.status(404).json({success:false,message:'Message introuvable.'}); return ok(res,row); }
