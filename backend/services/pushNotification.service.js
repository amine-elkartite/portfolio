import {disablePushToken,enabledPushTargets} from '../models/MobileSession.js';

const EXPO_PUSH_URL='https://exp.host/--/api/v2/push/send';
const expoTokenPattern=/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/;

export function isExpoPushToken(value){
  return typeof value==='string'&&value.length<=512&&expoTokenPattern.test(value);
}

function chunks(items,size){
  const result=[];
  for(let i=0;i<items.length;i+=size)result.push(items.slice(i,i+size));
  return result;
}

export async function sendNewMessageNotification(message){
  const targets=(await enabledPushTargets()).filter(target=>isExpoPushToken(target.push_token));
  if(!targets.length)return {sent:0,failed:0};
  let sent=0;let failed=0;
  for(const batch of chunks(targets,100)){
    const payload=batch.map(target=>({
      to:target.push_token,
      title:'New portfolio message',
      body:target.show_sender_name?`${message.name} sent: ${message.subject}`:'You received a new portfolio message.',
      sound:target.notification_sound?'default':null,
      badge:target.notification_badge?1:undefined,
      priority:'high',
      data:{type:'NEW_MESSAGE',messageId:message.id}
    }));
    try{
      const response=await fetch(EXPO_PUSH_URL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Accept-Encoding':'gzip, deflate'},body:JSON.stringify(payload)});
      if(!response.ok)throw new Error(`Expo push HTTP ${response.status}`);
      const result=await response.json();
      const tickets=Array.isArray(result.data)?result.data:[result.data];
      for(let i=0;i<tickets.length;i++){
        const ticket=tickets[i];
        if(ticket?.status==='ok'){sent++;continue;}
        failed++;
        if(ticket?.details?.error==='DeviceNotRegistered')await disablePushToken(batch[i].push_token);
      }
    }catch(error){
      failed+=batch.length;
      console.warn('[push notification]',error.message);
    }
  }
  return {sent,failed};
}
