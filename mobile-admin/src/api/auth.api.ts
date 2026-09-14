import {apiRequest,jsonBody} from './client';
import type {MobileAuthPayload,MobileSession,NotificationPreferences} from '../types/api';

export const authApi={
  login(input:{email:string;password:string;deviceId:string;deviceName:string;platform:'android'|'ios'|'unknown'}){
    return apiRequest<MobileAuthPayload>('/auth/mobile/login',{method:'POST',auth:false,skipRefresh:true,body:jsonBody(input)});
  },
  refresh(input:{refreshToken:string;deviceId:string}){
    return apiRequest<MobileAuthPayload>('/auth/mobile/refresh',{method:'POST',auth:false,skipRefresh:true,body:jsonBody(input)});
  },
  logout(refreshToken:string){return apiRequest<null>('/auth/mobile/logout',{method:'POST',auth:false,skipRefresh:true,body:jsonBody({refreshToken})});},
  sessions(){return apiRequest<MobileSession[]>('/auth/mobile/sessions');},
  revokeSession(id:number){return apiRequest<null>(`/auth/mobile/sessions/${id}`,{method:'DELETE'});},
  revokeOthers(){return apiRequest<{revoked:number}>('/auth/mobile/sessions/revoke-others',{method:'POST'});},
  enableBiometric(){return apiRequest<{enabled:boolean}>('/auth/mobile/biometric/enable',{method:'POST'});},
  disableBiometric(){return apiRequest<{enabled:boolean}>('/auth/mobile/biometric/disable',{method:'POST'});},
  notificationSettings(){return apiRequest<NotificationPreferences>('/auth/mobile/notifications');},
  registerPushToken(pushToken:string){return apiRequest<{registered:boolean}>('/auth/mobile/push-token',{method:'POST',body:jsonBody({pushToken})});},
  removePushToken(){return apiRequest<{registered:boolean}>('/auth/mobile/push-token',{method:'DELETE'});},
  updateNotificationSettings(settings:Partial<Omit<NotificationPreferences,'pushRegistered'>>){return apiRequest<NotificationPreferences>('/auth/mobile/notification-settings',{method:'PATCH',body:jsonBody(settings)});}
};
