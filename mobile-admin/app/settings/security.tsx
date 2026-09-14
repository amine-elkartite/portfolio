import React,{useState} from 'react';
import {Alert,Switch,Text,View} from 'react-native';
import {Redirect} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {authApi} from '../../src/api/auth.api';
import {useAuth} from '../../src/auth/AuthProvider';
import {queryClient} from '../../src/query/queryClient';
import {Card,ErrorState,LoadingState,PrimaryButton,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';

export default function SecuritySettings(){
  const {authenticated,locked,biometricEnabled,enableBiometric,disableBiometric,biometricCapability,logout}=useAuth();
  const {colors}=useTheme();const [error,setError]=useState('');const [working,setWorking]=useState(false);const [capability,setCapability]=useState('Checking device…');
  const sessions=useQuery({queryKey:['mobile-sessions'],queryFn:authApi.sessions,enabled:authenticated});
  React.useEffect(()=>{void biometricCapability().then(value=>setCapability(value.hardware?value.enrolled?'Biometrics available':'Hardware available, but no biometric is enrolled':'No biometric hardware detected')).catch(()=>setCapability('Unable to read biometric capability'));},[biometricCapability]);
  if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;
  const toggle=async(next:boolean)=>{setWorking(true);setError('');try{if(next)await enableBiometric();else await disableBiometric();await queryClient.invalidateQueries({queryKey:['mobile-sessions']});}catch(e){setError(e instanceof Error?e.message:'Unable to change biometric setting.');}finally{setWorking(false);}};
  const revoke=(id:number)=>Alert.alert('Disconnect device?','This device will need to sign in again.',[{text:'Cancel',style:'cancel'},{text:'Disconnect',style:'destructive',onPress:async()=>{try{await authApi.revokeSession(id);await queryClient.invalidateQueries({queryKey:['mobile-sessions']});}catch(e){setError(e instanceof Error?e.message:'Unable to revoke device.');}}}]);
  return <Screen><Title subtitle="Secure mobile access without weakening the existing web admin session model.">Security</Title>
    <Card><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:14}}><View style={{flex:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'800'}}>Biometric Login</Text><Text style={{color:colors.textMuted,fontSize:12,lineHeight:18,marginTop:4}}>Use fingerprint, Face ID or Touch ID to unlock the secure device credential.</Text></View><Switch disabled={working} value={biometricEnabled} onValueChange={next=>void toggle(next)}/></View><Text style={{color:colors.textMuted,fontSize:12,marginTop:12}}>Device status: {capability}</Text>{error?<Text accessibilityRole="alert" style={{color:colors.danger,marginTop:9}}>{error}</Text>:null}</Card>
    <Text style={{color:colors.text,fontSize:18,fontWeight:'800',marginTop:8,marginBottom:10}}>Active Devices</Text>
    {sessions.isLoading?<LoadingState/>:sessions.isError?<ErrorState message={sessions.error instanceof Error?sessions.error.message:'Unable to load devices.'} onRetry={()=>void sessions.refetch()}/>:sessions.data?.length?sessions.data.map(session=><Card key={session.id}><View style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><View style={{flex:1}}><Text style={{color:colors.text,fontWeight:'800'}}>{session.deviceName}{session.current?' · This device':''}</Text><Text style={{color:colors.textMuted,fontSize:12,marginTop:4}}>{session.platform} · {session.biometricEnabled?'Biometric enabled':'Password/session login'}</Text><Text style={{color:colors.textMuted,fontSize:11,marginTop:4}}>Last active: {session.lastUsedAt?new Date(session.lastUsedAt).toLocaleString():'Unknown'}</Text></View>{!session.current&&!session.revokedAt?<View style={{width:105}}><PrimaryButton title="Revoke" variant="danger" onPress={()=>revoke(session.id)}/></View>:null}</View></Card>):null}
    <PrimaryButton title="Log Out Other Devices" variant="secondary" onPress={()=>void authApi.revokeOthers().then(()=>queryClient.invalidateQueries({queryKey:['mobile-sessions']})).catch(e=>setError(e instanceof Error?e.message:'Unable to revoke other devices.'))}/>
    <PrimaryButton title="Log Out This Device" variant="danger" onPress={()=>void logout()}/>
  </Screen>;
}
