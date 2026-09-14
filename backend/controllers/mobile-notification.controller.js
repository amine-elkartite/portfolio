import {findMobileSession,setPushToken,updateNotificationSettings} from '../models/MobileSession.js';
import {isExpoPushToken} from '../services/pushNotification.service.js';
import {ok} from './crud.controller.js';

export async function getNotificationSettings(req,res){
  const session=await findMobileSession(req.auth.sessionId,req.user.id);
  if(!session)return res.status(404).json({success:false,message:'Session mobile introuvable.'});
  return ok(res,{
    notificationsEnabled:Boolean(session.notifications_enabled),
    sound:Boolean(session.notification_sound),
    vibration:Boolean(session.notification_vibration),
    badge:Boolean(session.notification_badge),
    showSenderName:Boolean(session.show_sender_name),
    pushRegistered:Boolean(session.push_registered)
  });
}

export async function registerPushToken(req,res){
  const {pushToken}=req.validated;
  if(!isExpoPushToken(pushToken))return res.status(422).json({success:false,message:'Jeton de notification invalide.'});
  const updated=await setPushToken(req.auth.sessionId,req.user.id,pushToken);
  if(!updated)return res.status(404).json({success:false,message:'Session mobile introuvable.'});
  return ok(res,{registered:true},'Notifications enregistrées pour cet appareil.');
}

export async function removePushToken(req,res){
  const updated=await setPushToken(req.auth.sessionId,req.user.id,null);
  if(!updated)return res.status(404).json({success:false,message:'Session mobile introuvable.'});
  return ok(res,{registered:false},'Notifications désactivées pour cet appareil.');
}

export async function saveNotificationSettings(req,res){
  const session=await updateNotificationSettings(req.auth.sessionId,req.user.id,{
    notifications_enabled:req.validated.notificationsEnabled,
    notification_sound:req.validated.sound,
    notification_vibration:req.validated.vibration,
    notification_badge:req.validated.badge,
    show_sender_name:req.validated.showSenderName
  });
  if(!session)return res.status(404).json({success:false,message:'Session mobile introuvable.'});
  return ok(res,{
    notificationsEnabled:Boolean(session.notifications_enabled),
    sound:Boolean(session.notification_sound),
    vibration:Boolean(session.notification_vibration),
    badge:Boolean(session.notification_badge),
    showSenderName:Boolean(session.show_sender_name),
    pushRegistered:Boolean(session.push_registered)
  },'Préférences de notification enregistrées.');
}
