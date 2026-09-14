import React,{useState} from 'react';
import {Linking,Switch,Text,View} from 'react-native';
import {Redirect} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {authApi} from '../../src/api/auth.api';
import {useAuth} from '../../src/auth/AuthProvider';
import {useNotifications} from '../../src/notifications/NotificationProvider';
import type {NotificationPreferences} from '../../src/types/api';
import {Card,ErrorState,LoadingState,PrimaryButton,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';

function NotificationPreferencesForm({initial}:{initial:NotificationPreferences}){
  const {colors}=useTheme();
  const {permission,refreshPermission,openDeviceSettingsHint}=useNotifications();
  const [prefs,setPrefs]=useState<NotificationPreferences>(initial);
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  const save=async(key:keyof Omit<NotificationPreferences,'pushRegistered'>,value:boolean)=>{const previous=prefs;const next={...prefs,[key]:value};setPrefs(next);setSaving(true);setError('');try{const updated=await authApi.updateNotificationSettings({[key]:value});setPrefs(updated);}catch(e){setPrefs(previous);setError(e instanceof Error?e.message:'Unable to save notification preference.');}finally{setSaving(false);}};
  const row=(label:string,description:string,key:keyof Omit<NotificationPreferences,'pushRegistered'>)=><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:14,paddingVertical:10}}><View style={{flex:1}}><Text style={{color:colors.text,fontWeight:'700'}}>{label}</Text><Text style={{color:colors.textMuted,fontSize:12,lineHeight:18,marginTop:3}}>{description}</Text></View><Switch disabled={saving} value={Boolean(prefs[key])} onValueChange={value=>void save(key,value)}/></View>;
  return <Screen><Title subtitle="Push preferences apply only to this signed-in mobile device.">Notifications</Title>
    <Card><Text style={{color:colors.text,fontSize:16,fontWeight:'800'}}>Device permission</Text><Text style={{color:permission==='granted'?colors.success:colors.warning,marginTop:5,fontWeight:'700'}}>{permission||'unknown'}</Text><Text style={{color:colors.textMuted,fontSize:12,marginTop:5}}>Push token: {prefs.pushRegistered?'registered':'not registered'}</Text>{openDeviceSettingsHint?<PrimaryButton title="Open Device Settings" variant="secondary" onPress={()=>void Linking.openSettings()}/>:null}<PrimaryButton title="Refresh Permission Status" variant="secondary" onPress={()=>void refreshPermission()}/></Card>
    <Card>{row('New contact messages','Receive a push when a visitor submits the portfolio contact form.','notificationsEnabled')}{row('Sound','Play the default notification sound.','sound')}{row('Vibration','Allow vibration where supported by the operating system.','vibration')}{row('Badge count','Show message activity on the app icon where supported.','badge')}{row('Show sender name','Include the sender name and subject in the notification preview.','showSenderName')}</Card>
    {error?<Text accessibilityRole="alert" style={{color:colors.danger}}>{error}</Text>:null}
  </Screen>;
}

export default function NotificationSettings(){
  const {authenticated,locked}=useAuth();
  const query=useQuery({queryKey:['notification-settings'],queryFn:authApi.notificationSettings,enabled:authenticated});
  if(locked)return <Redirect href="/unlock"/>;
  if(!authenticated)return <Redirect href="/login"/>;
  if(query.isLoading)return <Screen><LoadingState/></Screen>;
  if(query.isError||!query.data)return <Screen><ErrorState message={query.error instanceof Error?query.error.message:'Unable to load notification settings.'} onRetry={()=>void query.refetch()}/></Screen>;
  return <NotificationPreferencesForm initial={query.data}/>;
}
