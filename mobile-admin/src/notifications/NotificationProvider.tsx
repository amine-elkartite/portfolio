import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import {Platform} from 'react-native';
import {router} from 'expo-router';
import {authApi} from '../api/auth.api';
import {queryClient} from '../query/queryClient';
import {useAuth} from '../auth/AuthProvider';
import type {NotificationPayload} from '../types/api';

Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:true})});

type NotificationContextValue={permission:Notifications.PermissionStatus|null;refreshPermission:()=>Promise<void>;openDeviceSettingsHint:boolean};
const NotificationContext=createContext<NotificationContextValue|null>(null);

function parsePayload(data:Record<string,unknown>|undefined):NotificationPayload|null{
  if(!data||typeof data.type!=='string')return null;
  if(data.type==='NEW_MESSAGE')return {type:'NEW_MESSAGE',messageId:typeof data.messageId==='number'?data.messageId:Number(data.messageId)};
  if(data.type==='SECURITY_ALERT')return {type:'SECURITY_ALERT'};
  return null;
}

export function NotificationProvider({children}:{children:React.ReactNode}){
  const {authenticated}=useAuth();
  const [permission,setPermission]=useState<Notifications.PermissionStatus|null>(null);
  const pendingMessage=useRef<number|null>(null);

  const navigatePayload=useCallback((payload:NotificationPayload|null)=>{
    if(!payload)return;
    if(payload.type==='NEW_MESSAGE'&&payload.messageId&&Number.isFinite(payload.messageId)){
      if(authenticated)router.push(`/messages/${payload.messageId}`);
      else pendingMessage.current=payload.messageId;
    }
  },[authenticated]);

  const refreshPermission=useCallback(async()=>{
    const current=await Notifications.getPermissionsAsync();
    setPermission(current.status);
  },[]);

  useEffect(()=>{
    void refreshPermission();
    if(Platform.OS==='android')void Notifications.setNotificationChannelAsync('portfolio-messages',{name:'Portfolio messages',importance:Notifications.AndroidImportance.HIGH,vibrationPattern:[0,250,250,250],sound:'default'});
    const received=Notifications.addNotificationReceivedListener(notification=>{
      const payload=parsePayload(notification.request.content.data);
      if(payload?.type==='NEW_MESSAGE'){
        void queryClient.invalidateQueries({queryKey:['messages']});
        void queryClient.invalidateQueries({queryKey:['messages','unread-count']});
        void queryClient.invalidateQueries({queryKey:['dashboard']});
      }
    });
    const response=Notifications.addNotificationResponseReceivedListener(event=>navigatePayload(parsePayload(event.notification.request.content.data)));
    void Notifications.getLastNotificationResponseAsync().then(last=>{if(last)navigatePayload(parsePayload(last.notification.request.content.data));});
    return()=>{received.remove();response.remove();};
  },[navigatePayload,refreshPermission]);

  useEffect(()=>{
    if(authenticated&&pendingMessage.current){const id=pendingMessage.current;pendingMessage.current=null;router.push(`/messages/${id}`);}
  },[authenticated]);

  useEffect(()=>{
    if(!authenticated||!Device.isDevice)return;
    let cancelled=false;
    void (async()=>{
      let status=(await Notifications.getPermissionsAsync()).status;
      if(status==='undetermined')status=(await Notifications.requestPermissionsAsync()).status;
      if(cancelled)return;
      setPermission(status);
      if(status!=='granted')return;
      const projectId=process.env.EXPO_PUBLIC_EAS_PROJECT_ID||Constants.easConfig?.projectId||Constants.expoConfig?.extra?.eas?.projectId;
      if(!projectId){console.warn('[notifications] EAS project id is missing; push registration skipped.');return;}
      try{
        const token=(await Notifications.getExpoPushTokenAsync({projectId})).data;
        if(!cancelled)await authApi.registerPushToken(token);
      }catch(error){console.warn('[notifications] push registration failed',error instanceof Error?error.message:'unknown error');}
    })();
    return()=>{cancelled=true;};
  },[authenticated]);

  const value=useMemo(()=>({permission,refreshPermission,openDeviceSettingsHint:permission==='denied'}),[permission,refreshPermission]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(){const value=useContext(NotificationContext);if(!value)throw new Error('useNotifications must be used inside NotificationProvider');return value;}
