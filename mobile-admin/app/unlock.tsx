import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {Fingerprint} from 'lucide-react-native';
import {Redirect,router} from 'expo-router';
import {useAuth} from '../src/auth/AuthProvider';
import {Card,PrimaryButton,Screen,Title} from '../src/components/ui';
import {useTheme} from '../src/theme/ThemeProvider';

export default function UnlockScreen(){
  const {locked,authenticated,unlock,logout}=useAuth();
  const {colors}=useTheme();
  const [working,setWorking]=useState(false);
  const [error,setError]=useState('');
  if(!locked&&authenticated)return <Redirect href="/(tabs)"/>;
  if(!locked&&!authenticated)return <Redirect href="/login"/>;
  const doUnlock=async()=>{setWorking(true);setError('');try{if(await unlock())router.replace('/(tabs)');else setError('Biometric authentication failed or was cancelled.');}finally{setWorking(false);}};
  const loginWithPassword=async()=>{await logout();router.replace('/login');};
  return <Screen scroll={false}>
    <View style={{flex:1,justifyContent:'center'}}>
      <Title subtitle="Your admin session is protected by the biometric security configured on this device.">Unlock Admin</Title>
      <Card>
        <View style={{alignItems:'center',paddingVertical:22}}><Fingerprint size={58} color={colors.text}/><Text style={{color:colors.text,fontSize:17,fontWeight:'700',marginTop:16}}>Use fingerprint or biometrics to continue</Text><Text style={{color:colors.textMuted,textAlign:'center',marginTop:8,lineHeight:20}}>Your fingerprint never leaves the operating system.</Text></View>
        {error?<Text accessibilityRole="alert" style={{color:colors.danger,textAlign:'center',marginBottom:8}}>{error}</Text>:null}
        <PrimaryButton title="Unlock with Biometrics" onPress={()=>void doUnlock()} loading={working}/>
        <PrimaryButton title="Use Password Instead" variant="secondary" onPress={()=>void loginWithPassword()}/>
      </Card>
    </View>
  </Screen>;
}
