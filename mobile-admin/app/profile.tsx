import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {Redirect,router} from 'expo-router';
import {Controller,useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useAuth} from '../src/auth/AuthProvider';
import {settingsApi} from '../src/api/settings.api';
import {Card,Divider,Field,PrimaryButton,Screen,Title} from '../src/components/ui';
import {useTheme} from '../src/theme/ThemeProvider';

const schema=z.object({current_password:z.string().min(1),new_password:z.string().min(12,'Use at least 12 characters.').max(72),confirm:z.string().min(1)}).refine(v=>v.new_password===v.confirm,{path:['confirm'],message:'Passwords do not match.'});
type FormValues=z.infer<typeof schema>;
export default function ProfileScreen(){
  const {authenticated,locked,user,logout}=useAuth();const {colors}=useTheme();const [message,setMessage]=useState('');const [error,setError]=useState('');
  const {control,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormValues>({resolver:zodResolver(schema),defaultValues:{current_password:'',new_password:'',confirm:''}});
  if(locked)return <Redirect href="/unlock"/>;if(!authenticated||!user)return <Redirect href="/login"/>;
  const change=handleSubmit(async values=>{setError('');setMessage('');try{await settingsApi.changePassword({current_password:values.current_password,new_password:values.new_password});setMessage('Password changed. All sessions were revoked.');await logout();router.replace('/login');}catch(e){setError(e instanceof Error?e.message:'Unable to change password.');}});
  return <Screen><Title subtitle="Authenticated administrator account.">Profile</Title><Card><Text style={{color:colors.textMuted,fontSize:12,fontWeight:'700'}}>NAME</Text><Text style={{color:colors.text,fontSize:20,fontWeight:'800',marginTop:5}}>{user.name}</Text><Divider/><Text style={{color:colors.textMuted,fontSize:12,fontWeight:'700'}}>EMAIL</Text><Text style={{color:colors.text,marginTop:5}}>{user.email}</Text><Divider/><Text style={{color:colors.textMuted,fontSize:12,fontWeight:'700'}}>ROLE</Text><Text style={{color:colors.text,marginTop:5,textTransform:'uppercase'}}>{user.role}</Text><View style={{marginTop:14}}><PrimaryButton title="Security & Active Devices" variant="secondary" onPress={()=>router.push('/settings/security')}/></View></Card>
    <Card><Text style={{color:colors.text,fontSize:17,fontWeight:'800',marginBottom:14}}>Change Password</Text><Controller control={control} name="current_password" render={({field:{value,onChange}})=><Field label="Current password" value={value} onChangeText={onChange} secureTextEntry error={errors.current_password?.message}/>}/><Controller control={control} name="new_password" render={({field:{value,onChange}})=><Field label="New password" value={value} onChangeText={onChange} secureTextEntry error={errors.new_password?.message}/>}/><Controller control={control} name="confirm" render={({field:{value,onChange}})=><Field label="Confirm new password" value={value} onChangeText={onChange} secureTextEntry error={errors.confirm?.message}/>}/>{error?<Text accessibilityRole="alert" style={{color:colors.danger,marginBottom:8}}>{error}</Text>:null}{message?<Text style={{color:colors.success,marginBottom:8}}>{message}</Text>:null}<PrimaryButton title="Change Password" loading={isSubmitting} onPress={()=>void change()}/></Card>
    <PrimaryButton title="Log Out" variant="danger" onPress={()=>void logout().then(()=>router.replace('/login'))}/>
  </Screen>;
}
