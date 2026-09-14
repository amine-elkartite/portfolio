import React,{useEffect,useState} from 'react';
import {Switch,Text,View} from 'react-native';
import {Redirect} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {settingsApi} from '../../src/api/settings.api';
import {useAuth} from '../../src/auth/AuthProvider';
import {queryClient} from '../../src/query/queryClient';
import {Card,ErrorState,Field,LoadingState,PrimaryButton,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';

export default function GeneralSettings(){
  const {authenticated,locked}=useAuth();const {colors}=useTheme();const query=useQuery({queryKey:['settings'],queryFn:settingsApi.get,enabled:authenticated});
  const [availability,setAvailability]=useState(true);const [linkedin,setLinkedin]=useState('');const [github,setGithub]=useState('');const [instagram,setInstagram]=useState('');const [working,setWorking]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
  useEffect(()=>{if(!query.data)return;setAvailability(String(query.data.availability)==='true'||query.data.availability===true);setLinkedin(String(query.data.linkedin_url||''));setGithub(String(query.data.github_url||''));setInstagram(String(query.data.instagram_url||''));},[query.data]);
  if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;if(query.isLoading)return <Screen><LoadingState/></Screen>;if(query.isError)return <Screen><ErrorState message={query.error instanceof Error?query.error.message:'Unable to load settings.'} onRetry={()=>void query.refetch()}/></Screen>;
  const save=async()=>{setWorking(true);setMessage('');setError('');try{await settingsApi.update({availability,linkedin_url:linkedin,github_url:github,instagram_url:instagram});await queryClient.invalidateQueries({queryKey:['settings']});setMessage('Website settings saved.');}catch(e){setError(e instanceof Error?e.message:'Unable to save settings.');}finally{setWorking(false);}};
  return <Screen><Title subtitle="These values update the same website settings used by the public portfolio.">Website & Social</Title><Card><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:16}}><View style={{flex:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'800'}}>Available for work</Text><Text style={{color:colors.textMuted,fontSize:12,lineHeight:18,marginTop:3}}>Controls the public availability setting.</Text></View><Switch value={availability} onValueChange={setAvailability}/></View><Field label="LinkedIn URL" value={linkedin} onChangeText={setLinkedin} autoCapitalize="none"/><Field label="GitHub URL" value={github} onChangeText={setGithub} autoCapitalize="none"/><Field label="Instagram URL" value={instagram} onChangeText={setInstagram} autoCapitalize="none"/>{error?<Text accessibilityRole="alert" style={{color:colors.danger,marginBottom:8}}>{error}</Text>:null}{message?<Text style={{color:colors.success,marginBottom:8}}>{message}</Text>:null}<PrimaryButton title="Save Settings" loading={working} onPress={()=>void save()}/></Card></Screen>;
}
